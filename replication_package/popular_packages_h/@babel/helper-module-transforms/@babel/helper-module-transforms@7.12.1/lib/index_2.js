"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rewriteModuleStatementsAndPrepareHeader = rewriteModuleStatementsAndPrepareHeader;
exports.ensureStatementsHoisted = ensureStatementsHoisted;
exports.wrapInterop = wrapInterop;
exports.buildNamespaceInitStatements = buildNamespaceInitStatements;

Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: () => _helperModuleImports.isModule
});
Object.defineProperty(exports, "rewriteThis", {
  enumerable: true,
  get: () => _rewriteThis.default
});
Object.defineProperty(exports, "hasExports", {
  enumerable: true,
  get: () => _normalizeAndLoadMetadata.hasExports
});
Object.defineProperty(exports, "isSideEffectImport", {
  enumerable: true,
  get: () => _normalizeAndLoadMetadata.isSideEffectImport
});
Object.defineProperty(exports, "getModuleName", {
  enumerable: true,
  get: () => _getModuleName.default
});

const _assert = require("assert").default;
const t = require("@babel/types");
const _template = require("@babel/template").default;
const _chunk = require("lodash/chunk").default;
const _helperModuleImports = require("@babel/helper-module-imports");
const _rewriteThis = require("./rewrite-this").default;
const _rewriteLiveReferences = require("./rewrite-live-references").default;
const _normalizeAndLoadMetadata = require("./normalize-and-load-metadata");
const _getModuleName = require("./get-module-name").default;

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = () => cache;
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) return obj;
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return { default: obj };
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) return cache.get(obj);
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) cache.set(obj, newObj);
  return newObj;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function rewriteModuleStatementsAndPrepareHeader(path, options) {
  const {
    exportName,
    strict,
    allowTopLevelThis,
    strictMode,
    loose,
    noInterop,
    lazy,
    esNamespaceOnly
  } = options;
  
  _assert(_helperModuleImports.isModule(path), "Cannot process module statements in a script");
  
  path.node.sourceType = "script";
  const meta = _normalizeAndLoadMetadata.default(path, exportName, {
    noInterop,
    loose,
    lazy,
    esNamespaceOnly
  });

  if (!allowTopLevelThis) {
    _rewriteThis.default(path);
  }

  _rewriteLiveReferences.default(path, meta);
  if (strictMode !== false) {
    const hasStrict = path.node.directives.some(directive => directive.value.value === "use strict");
    if (!hasStrict) {
      path.unshiftContainer("directives", t.directive(t.directiveLiteral("use strict")));
    }
  }

  const headers = [];
  if (_normalizeAndLoadMetadata.hasExports(meta) && !strict) {
    headers.push(buildESModuleHeader(meta, loose));
  }

  const nameList = buildExportNameListDeclaration(path, meta);

  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }

  headers.push(...buildExportInitializationStatements(path, meta, loose));
  return { meta, headers };
}

function ensureStatementsHoisted(statements) {
  statements.forEach(header => (header._blockHoist = 3));
}

function wrapInterop(programPath, expr, type) {
  if (type === "none") return null;
  const helper = type === "default" ? "interopRequireDefault" : "interopRequireWildcard";
  return t.callExpression(programPath.hub.addHelper(helper), [expr]);
}

function buildNamespaceInitStatements(metadata, sourceMetadata, loose = false) {
  const statements = [];
  let srcNamespace = t.identifier(sourceMetadata.name);
  if (sourceMetadata.lazy) srcNamespace = t.callExpression(srcNamespace, []);
  
  for (const localName of sourceMetadata.importsNamespace) {
    if (localName === sourceMetadata.name) continue;
    statements.push(_template.statement`var NAME = SOURCE;`({
      NAME: localName,
      SOURCE: t.cloneNode(srcNamespace)
    }));
  }

  if (loose) statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, loose));
  
  for (const exportName of sourceMetadata.reexportNamespace) {
    const statement = sourceMetadata.lazy ? _template.statement`
      Object.defineProperty(EXPORTS, "NAME", {
        enumerable: true,
        get: function() {
          return NAMESPACE;
        }
      });
    ` : _template.statement`EXPORTS.NAME = NAMESPACE;`;
    
    statements.push(statement({
      EXPORTS: metadata.exportName,
      NAME: exportName,
      NAMESPACE: t.cloneNode(srcNamespace)
    }));
  }

  if (sourceMetadata.reexportAll) {
    const statement = buildNamespaceReexport(metadata, t.cloneNode(srcNamespace), loose);
    statement.loc = sourceMetadata.reexportAll.loc;
    statements.push(statement);
  }

  return statements;
}

const ReexportTemplate = {
  loose: _template.statement`EXPORTS.EXPORT_NAME = NAMESPACE_IMPORT;`,
  looseComputed: _template.statement`EXPORTS["EXPORT_NAME"] = NAMESPACE_IMPORT;`,
  spec: _template`
    Object.defineProperty(EXPORTS, "EXPORT_NAME", {
      enumerable: true,
      get: function() {
        return NAMESPACE_IMPORT;
      }
    });
  `
};

function buildReexportsFromMeta(meta, metadata, loose) {
  const namespace = metadata.lazy ? t.callExpression(t.identifier(metadata.name), []) : t.identifier(metadata.name);
  const { stringSpecifiers } = meta;
  
  return Array.from(metadata.reexports, ([exportName, importName]) => {
    const NAMESPACE_IMPORT = stringSpecifiers.has(importName)
      ? t.memberExpression(t.cloneNode(namespace), t.stringLiteral(importName), true)
      : t.memberExpression(t.cloneNode(namespace), t.identifier(importName));

    const astNodes = { EXPORTS: meta.exportName, EXPORT_NAME: exportName, NAMESPACE_IMPORT };

    if (loose) {
      return stringSpecifiers.has(exportName) ? ReexportTemplate.looseComputed(astNodes) : ReexportTemplate.loose(astNodes);
    } else {
      return ReexportTemplate.spec(astNodes);
    }
  });
}

function buildESModuleHeader(metadata, enumerable = false) {
  const template = enumerable
    ? _template.statement`EXPORTS.__esModule = true;`
    : _template.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true,
        });
      `;
  
  return template({ EXPORTS: metadata.exportName });
}

function buildNamespaceReexport(metadata, namespace, loose) {
  const template = loose
    ? _template.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;
          if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;

          EXPORTS[key] = NAMESPACE[key];
        });
      ` 
    : _template.statement`
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
      `;

  return template({
    NAMESPACE: namespace,
    EXPORTS: metadata.exportName,
    VERIFY_NAME_LIST: metadata.exportNameListName ? 
      _template`if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;`({ EXPORTS_LIST: metadata.exportNameListName }) 
      : null
  });
}

function buildExportNameListDeclaration(programPath, metadata) {
  const exportedVars = {};

  for (const data of metadata.local.values()) data.names.forEach(name => exportedVars[name] = true);

  let hasReexport = false;
  for (const data of metadata.source.values()) {
    for (const exportName of data.reexports.keys()) {
      exportedVars[exportName] = true;
    }

    for (const exportName of data.reexportNamespace) {
      exportedVars[exportName] = true;
    }

    hasReexport = hasReexport || data.reexportAll;
  }

  if (!hasReexport || !Object.keys(exportedVars).length) return null;

  const name = programPath.scope.generateUidIdentifier("exportNames");
  delete exportedVars.default;
  return {
    name: name.name,
    statement: t.variableDeclaration("var", [t.variableDeclarator(name, t.valueToNode(exportedVars))])
  };
}

function buildExportInitializationStatements(programPath, metadata, loose = false) {
  const initStatements = [];
  const exportNames = [];

  for (const [localName, data] of metadata.local.entries()) {
    if (data.kind === "hoisted") {
      initStatements.push(buildInitStatement(metadata, data.names, t.identifier(localName)));
    } else {
      exportNames.push(...data.names);
    }
  }

  for (const data of metadata.source.values()) {
    if (!loose) initStatements.push(...buildReexportsFromMeta(metadata, data, loose));
    exportNames.push(...data.reexportNamespace);
  }

  initStatements.push(
    ..._chunk(exportNames, 100).map(members => buildInitStatement(metadata, members, programPath.scope.buildUndefinedNode()))
  );

  return initStatements;
}

const InitTemplate = {
  computed: _template.expression`EXPORTS["NAME"] = VALUE`,
  default: _template.expression`EXPORTS.NAME = VALUE`
};

function buildInitStatement(metadata, exportNames, initExpr) {
  const { stringSpecifiers, exportName: EXPORTS } = metadata;
  return t.expressionStatement(exportNames.reduce((acc, exportName) => {
    const params = { EXPORTS, NAME: exportName, VALUE: acc };
    return stringSpecifiers.has(exportName) ? InitTemplate.computed(params) : InitTemplate.default(params);
  }, initExpr));
}
