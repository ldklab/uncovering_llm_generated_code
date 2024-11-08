"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const _assert = require("assert");
const _core = require("@babel/core");
const _helperModuleImports = require("@babel/helper-module-imports");
const _rewriteThis = require("./rewrite-this.js");
const _rewriteLiveReferences = require("./rewrite-live-references.js");
const _normalizeAndLoadMetadata = require("./normalize-and-load-metadata.js");
const Lazy = require("./lazy-modules.js");
const _dynamicImport = require("./dynamic-import.js");
const _getModuleName = require("./get-module-name.js");

exports.buildNamespaceInitStatements = buildNamespaceInitStatements;
exports.ensureStatementsHoisted = ensureStatementsHoisted;
exports.rewriteModuleStatementsAndPrepareHeader = rewriteModuleStatementsAndPrepareHeader;
exports.wrapInterop = wrapInterop;

Object.defineProperty(exports, "buildDynamicImport", {
  enumerable: true,
  get: () => _dynamicImport.buildDynamicImport,
});

Object.defineProperty(exports, "getModuleName", {
  enumerable: true,
  get: () => _getModuleName.default,
});

Object.defineProperty(exports, "hasExports", {
  enumerable: true,
  get: () => _normalizeAndLoadMetadata.hasExports,
});

Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: () => _helperModuleImports.isModule,
});

Object.defineProperty(exports, "isSideEffectImport", {
  enumerable: true,
  get: () => _normalizeAndLoadMetadata.isSideEffectImport,
});

Object.defineProperty(exports, "rewriteThis", {
  enumerable: true,
  get: () => _rewriteThis.default,
});

exports.getDynamicImportSource = require("./dynamic-import").getDynamicImportSource;

function rewriteModuleStatementsAndPrepareHeader(path, options) {
  const {
    exportName, strict, allowTopLevelThis, strictMode, noInterop,
    importInterop = noInterop ? "none" : "babel", lazy,
    getWrapperPayload = Lazy.toGetWrapperPayload(lazy || false),
    wrapReference = Lazy.wrapReference, esNamespaceOnly, filename,
    constantReexports = options.loose, enumerableModuleMeta = options.loose,
    noIncompleteNsImportDetection
  } = options;

  _normalizeAndLoadMetadata.validateImportInteropOption(importInterop);
  _assert(_helperModuleImports.isModule(path), "Cannot process module statements in a script");
  path.node.sourceType = "script";

  const meta = _normalizeAndLoadMetadata.default(path, exportName, {
    importInterop, initializeReexports: constantReexports,
    getWrapperPayload, esNamespaceOnly, filename
  });

  if (!allowTopLevelThis) {
    _rewriteThis.default(path);
  }

  _rewriteLiveReferences.default(path, meta, wrapReference);

  if (strictMode !== false) {
    const hasStrict = path.node.directives.some(directive => directive.value.value === "use strict");
    if (!hasStrict) {
      path.unshiftContainer("directives", _core.types.directive(_core.types.directiveLiteral("use strict")));
    }
  }

  const headers = [];
  if (_normalizeAndLoadMetadata.hasExports(meta) && !strict) {
    headers.push(buildESModuleHeader(meta, enumerableModuleMeta));
  }

  const nameList = buildExportNameListDeclaration(path, meta);
  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }

  headers.push(...buildExportInitializationStatements(path, meta, wrapReference, constantReexports, noIncompleteNsImportDetection));

  return { meta, headers };
}

function ensureStatementsHoisted(statements) {
  statements.forEach(header => {
    header._blockHoist = 3;
  });
}

function wrapInterop(programPath, expr, type) {
  if (type === "none") {
    return null;
  }
  let helper;
  if (type === "node-namespace") {
    return _core.types.callExpression(programPath.hub.addHelper("interopRequireWildcard"), [expr, _core.types.booleanLiteral(true)]);
  } else if (type === "node-default") {
    return null;
  } else if (type === "default") {
    helper = "interopRequireDefault";
  } else if (type === "namespace") {
    helper = "interopRequireWildcard";
  } else {
    throw new Error(`Unknown interop: ${type}`);
  }
  return _core.types.callExpression(programPath.hub.addHelper(helper), [expr]);
}

function buildNamespaceInitStatements(metadata, sourceMetadata, constantReexports = false, wrapReference = Lazy.wrapReference) {
  const statements = [];
  const srcNamespaceId = _core.types.identifier(sourceMetadata.name);

  for (const localName of sourceMetadata.importsNamespace) {
    if (localName !== sourceMetadata.name) {
      statements.push(_core.template.statement`var NAME = SOURCE;`({
        NAME: localName,
        SOURCE: _core.types.cloneNode(srcNamespaceId)
      }));
    }
  }

  const srcNamespace = wrapReference(srcNamespaceId, sourceMetadata.wrap) || srcNamespaceId;

  if (constantReexports) {
    statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, true, wrapReference));
  }

  for (const exportName of sourceMetadata.reexportNamespace) {
    statements.push(!_core.types.isIdentifier(srcNamespace)
      ? _core.template.statement`
        Object.defineProperty(EXPORTS, "NAME", {
          enumerable: true,
          get: function() {
            return NAMESPACE;
          }
        });
      ` : _core.template.statement`EXPORTS.NAME = NAMESPACE;`)({
      EXPORTS: metadata.exportName,
      NAME: exportName,
      NAMESPACE: _core.types.cloneNode(srcNamespace)
    });
  }

  if (sourceMetadata.reexportAll) {
    const statement = buildNamespaceReexport(metadata, _core.types.cloneNode(srcNamespace), constantReexports);
    statement.loc = sourceMetadata.reexportAll.loc;
    statements.push(statement);
  }

  return statements;
}

const ReexportTemplate = {
  constant: ({ exports, exportName, namespaceImport }) => _core.template.statement.ast`
    ${exports}.${exportName} = ${namespaceImport};
  `,
  constantComputed: ({ exports, exportName, namespaceImport }) => _core.template.statement.ast`
    ${exports}["${exportName}"] = ${namespaceImport};
  `,
  spec: ({ exports, exportName, namespaceImport }) => _core.template.statement.ast`
    Object.defineProperty(${exports}, "${exportName}", {
      enumerable: true,
      get: function() {
        return ${namespaceImport};
      },
    });
  `
};

function buildReexportsFromMeta(meta, metadata, constantReexports, wrapReference) {
  let namespace = _core.types.identifier(metadata.name);
  namespace = wrapReference(namespace, metadata.wrap) || namespace;

  const { stringSpecifiers } = meta;
  return Array.from(metadata.reexports, ([exportName, importName]) => {
    let namespaceImport = _core.types.cloneNode(namespace);
    if (importName !== "default" || metadata.interop !== "node-default") {
      if (stringSpecifiers.has(importName)) {
        namespaceImport = _core.types.memberExpression(namespaceImport, _core.types.stringLiteral(importName), true);
      } else {
        namespaceImport = _core.types.memberExpression(namespaceImport, _core.types.identifier(importName));
      }
    }

    const astNodes = {
      exports: meta.exportName,
      exportName,
      namespaceImport
    };

    if (constantReexports || _core.types.isIdentifier(namespaceImport)) {
      return stringSpecifiers.has(exportName)
        ? ReexportTemplate.constantComputed(astNodes)
        : ReexportTemplate.constant(astNodes);
    } else {
      return ReexportTemplate.spec(astNodes);
    }
  });
}

function buildESModuleHeader(metadata, enumerableModuleMeta = false) {
  return (enumerableModuleMeta
    ? _core.template.statement`EXPORTS.__esModule = true;`
    : _core.template.statement`
    Object.defineProperty(EXPORTS, "__esModule", {
      value: true,
    });
  `)({ EXPORTS: metadata.exportName });
}

function buildNamespaceReexport(metadata, namespace, constantReexports) {
  return (constantReexports ? _core.template.statement`
    Object.keys(NAMESPACE).forEach(function(key) {
      if (key === "default" || key === "__esModule") return;
      VERIFY_NAME_LIST;
      if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;

      EXPORTS[key] = NAMESPACE[key];
    });
  ` : _core.template.statement`
    Object.keys(NAMESPACE).forEach(function(key) {
      if (key === "default" || key === "__esModule") return;
      VERIFY_NAME_LIST;
      if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;

      Object.defineProperty(EXPORTS, key, {
        enumerable: true,
        get: function() {
          return NAMESPACE[key];
        },
      });
    });
  `)({
    NAMESPACE: namespace,
    EXPORTS: metadata.exportName,
    VERIFY_NAME_LIST: metadata.exportNameListName
      ? _core.template`if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;`({
        EXPORTS_LIST: metadata.exportNameListName,
      })
      : null,
  });
}

function buildExportNameListDeclaration(programPath, metadata) {
  const exportedVars = {};

  for (const data of metadata.local.values()) {
    for (const name of data.names) {
      exportedVars[name] = true;
    }
  }

  let hasReexport = false;

  for (const data of metadata.source.values()) {
    for (const exportName of data.reexports.keys()) {
      exportedVars[exportName] = true;
    }
    for (const exportName of data.reexportNamespace) {
      exportedVars[exportName] = true;
    }
    hasReexport = hasReexport || !!data.reexportAll;
  }

  if (!hasReexport || !Object.keys(exportedVars).length) return null;

  const name = programPath.scope.generateUidIdentifier("exportNames");
  delete exportedVars.default;

  return {
    name: name.name,
    statement: _core.types.variableDeclaration("var", [
      _core.types.variableDeclarator(name, _core.types.valueToNode(exportedVars))
    ])
  };
}

function buildExportInitializationStatements(programPath, metadata, wrapReference, constantReexports = false, noIncompleteNsImportDetection = false) {
  const initStatements = [];

  for (const [localName, data] of metadata.local) {
    if (data.kind === "hoisted") {
      initStatements.push([
        data.names[0],
        buildInitStatement(metadata, data.names, _core.types.identifier(localName))
      ]);
    } else if (!noIncompleteNsImportDetection) {
      for (const exportName of data.names) {
        initStatements.push([exportName, null]);
      }
    }
  }

  for (const data of metadata.source.values()) {
    if (!constantReexports) {
      const reexportsStatements = buildReexportsFromMeta(metadata, data, false, wrapReference);
      const reexports = Array.from(data.reexports.keys());
      for (let i = 0; i < reexportsStatements.length; i++) {
        initStatements.push([reexports[i], reexportsStatements[i]]);
      }
    }
    if (!noIncompleteNsImportDetection) {
      for (const exportName of data.reexportNamespace) {
        initStatements.push([exportName, null]);
      }
    }
  }

  initStatements.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const results = [];

  if (noIncompleteNsImportDetection) {
    for (const [, initStatement] of initStatements) {
      results.push(initStatement);
    }
  } else {
    const chunkSize = 100;
    for (let i = 0; i < initStatements.length; i += chunkSize) {
      let uninitializedExportNames = [];
      for (let j = 0; j < chunkSize && i + j < initStatements.length; j++) {
        const [exportName, initStatement] = initStatements[i + j];
        if (initStatement !== null) {
          if (uninitializedExportNames.length > 0) {
            results.push(buildInitStatement(metadata, uninitializedExportNames, programPath.scope.buildUndefinedNode()));
            uninitializedExportNames = [];
          }
          results.push(initStatement);
        } else {
          uninitializedExportNames.push(exportName);
        }
      }
      if (uninitializedExportNames.length > 0) {
        results.push(buildInitStatement(metadata, uninitializedExportNames, programPath.scope.buildUndefinedNode()));
      }
    }
  }

  return results;
}

const InitTemplate = {
  computed: ({ exports, name, value }) => _core.template.expression.ast`${exports}["${name}"] = ${value}`,
  default: ({ exports, name, value }) => _core.template.expression.ast`${exports}.${name} = ${value}`,
  define: ({ exports, name, value }) => _core.template.expression.ast`
    Object.defineProperty(${exports}, "${name}", {
      enumerable: true,
      value: void 0,
      writable: true
    })["${name}"] = ${value}`
};

function buildInitStatement(metadata, exportNames, initExpr) {
  const { stringSpecifiers, exportName: exports } = metadata;
  return _core.types.expressionStatement(
    exportNames.reduce((value, name) => {
      const params = { exports, name, value };
      if (name === "__proto__") {
        return InitTemplate.define(params);
      }
      return stringSpecifiers.has(name)
        ? InitTemplate.computed(params)
        : InitTemplate.default(params);
    }, initExpr)
  );
}

//# sourceMappingURL=index.js.map
