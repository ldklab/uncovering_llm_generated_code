"use strict";

import assert from "assert";
import * as t from "@babel/types";
import template from "@babel/template";
import chunk from "lodash/chunk";
import { isModule as _isModule } from "@babel/helper-module-imports";
import _rewriteThis from "./rewrite-this";
import _rewriteLiveReferences from "./rewrite-live-references";
import * as _normalizeAndLoadMetadata from "./normalize-and-load-metadata";
import _getModuleName from "./get-module-name";

export { rewriteModuleStatementsAndPrepareHeader, ensureStatementsHoisted, wrapInterop, buildNamespaceInitStatements };
export { _isModule as isModule };
export { _rewriteThis as rewriteThis };
export { _normalizeAndLoadMetadata.hasExports as hasExports };
export { _normalizeAndLoadMetadata.isSideEffectImport as isSideEffectImport };
export { _getModuleName as getModuleName };

function _getRequireWildcardCache() { return typeof WeakMap !== "function" ? null : new WeakMap(); }

function _interopRequireWildcard(obj) {
  if (!obj || (obj !== "object" && typeof obj !== "function")) return { default: obj };
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) return cache.get(obj);
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = Object.getOwnPropertyDescriptor(obj, key);
      Object.defineProperty(newObj, key, desc ? desc : { value: obj[key], writable: true, enumerable: true, configurable: true });
    }
  }
  newObj.default = obj;
  if (cache) cache.set(obj, newObj);
  return newObj;
}

function _interopRequireDefault(obj) { return (obj && obj.__esModule) ? obj : { default: obj }; }

function rewriteModuleStatementsAndPrepareHeader(path, options) {
  const { exportName, strict, allowTopLevelThis, strictMode, loose, noInterop, lazy, esNamespaceOnly } = options;
  assert(_isModule(path), "Cannot process module statements in a script");
  path.node.sourceType = "script";
  const meta = _normalizeAndLoadMetadata.default(path, exportName, { noInterop, loose, lazy, esNamespaceOnly });

  if (!allowTopLevelThis) {
    _rewriteThis(path);
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
  statements.forEach(header => header._blockHoist = 3);
}

function wrapInterop(programPath, expr, type) {
  if (type === "none") return null;
  const helper = type === "default" ? "interopRequireDefault" : type === "namespace" ? "interopRequireWildcard" : null;
  if (!helper) throw new Error(`Unknown interop: ${type}`);
  return t.callExpression(programPath.hub.addHelper(helper), [expr]);
}

function buildNamespaceInitStatements(metadata, sourceMetadata, loose = false) {
  const statements = [];
  let srcNamespace = t.identifier(sourceMetadata.name);
  if (sourceMetadata.lazy) srcNamespace = t.callExpression(srcNamespace, []);

  for (const localName of sourceMetadata.importsNamespace) {
    if (localName !== sourceMetadata.name) {
      statements.push(template.statement`var NAME = SOURCE;`({ NAME: localName, SOURCE: t.cloneNode(srcNamespace) }));
    }
  }

  if (loose) {
    statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, loose));
  }

  for (const exportName of sourceMetadata.reexportNamespace) {
    statements.push((sourceMetadata.lazy ? template.statement`
            Object.defineProperty(EXPORTS, "NAME", {
              enumerable: true,
              get: function() {
                return NAMESPACE;
              }
            });
          ` : template.statement`EXPORTS.NAME = NAMESPACE;`)({
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
  loose: template.statement`EXPORTS.EXPORT_NAME = NAMESPACE_IMPORT;`,
  looseComputed: template.statement`EXPORTS["EXPORT_NAME"] = NAMESPACE_IMPORT;`,
  spec: template`
    Object.defineProperty(EXPORTS, "EXPORT_NAME", {
      enumerable: true,
      get: function() {
        return NAMESPACE_IMPORT;
      },
    });
    `
};

const buildReexportsFromMeta = (meta, metadata, loose) => {
  const namespace = metadata.lazy ? t.callExpression(t.identifier(metadata.name), []) : t.identifier(metadata.name);
  const { stringSpecifiers } = meta;
  return Array.from(metadata.reexports, ([exportName, importName]) => {
    const NAMESPACE_IMPORT = stringSpecifiers.has(importName)
      ? t.memberExpression(t.cloneNode(namespace), t.stringLiteral(importName), true)
      : t.memberExpression(t.cloneNode(namespace), t.identifier(importName));

    const astNodes = { EXPORTS: meta.exportName, EXPORT_NAME: exportName, NAMESPACE_IMPORT };
    return loose
      ? (stringSpecifiers.has(exportName) ? ReexportTemplate.looseComputed(astNodes) : ReexportTemplate.loose(astNodes))
      : ReexportTemplate.spec(astNodes);
  });
};

function buildESModuleHeader(metadata, enumerable = false) {
  return (enumerable ? template.statement`
        EXPORTS.__esModule = true;
      ` : template.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true,
        });
      `)({
    EXPORTS: metadata.exportName
  });
}

function buildNamespaceReexport(metadata, namespace, loose) {
  return (loose ? template.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;
          if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;
          EXPORTS[key] = NAMESPACE[key];
        });
      ` : template.statement`
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
    VERIFY_NAME_LIST: metadata.exportNameListName ? template`
            if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;
          `({ EXPORTS_LIST: metadata.exportNameListName }) : null,
  });
}

function buildExportNameListDeclaration(programPath, metadata) {
  const exportedVars = {};
  for (const data of metadata.local.values()) {
    data.names.forEach(name => exportedVars[name] = true);
  }

  let hasReexport = false;
  for (const data of metadata.source.values()) {
    data.reexports.forEach((_, exportName) => exportedVars[exportName] = true);
    data.reexportNamespace.forEach(exportName => exportedVars[exportName] = true);
    hasReexport = hasReexport || data.reexportAll;
  }

  if (!hasReexport || Object.keys(exportedVars).length === 0) return null;
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

  for (const [localName, data] of metadata.local) {
    if (data.kind === "import") continue;
    if (data.kind === "hoisted") {
      initStatements.push(buildInitStatement(metadata, data.names, t.identifier(localName)));
    } else {
      exportNames.push(...data.names);
    }
  }

  metadata.source.forEach(data => {
    if (!loose) {
      initStatements.push(...buildReexportsFromMeta(metadata, data, loose));
    }
    data.reexportNamespace.forEach(exportName => exportNames.push(exportName));
  });

  initStatements.push(...chunk(exportNames, 100).map(members =>
    buildInitStatement(metadata, members, programPath.scope.buildUndefinedNode())
  ));
  return initStatements;
}

const InitTemplate = {
  computed: template.expression`EXPORTS["NAME"] = VALUE`,
  default: template.expression`EXPORTS.NAME = VALUE`,
};

function buildInitStatement(metadata, exportNames, initExpr) {
  const { stringSpecifiers, exportName: EXPORTS } = metadata;
  return t.expressionStatement(exportNames.reduce((acc, exportName) => {
    const params = { EXPORTS, NAME: exportName, VALUE: acc };
    return stringSpecifiers.has(exportName) ? InitTemplate.computed(params) : InitTemplate.default(params);
  }, initExpr));
}
