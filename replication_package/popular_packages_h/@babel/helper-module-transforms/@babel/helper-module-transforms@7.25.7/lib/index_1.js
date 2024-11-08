"use strict";

import assert from "assert";
import { types as t } from "@babel/core";
import * as helperModuleImports from "@babel/helper-module-imports";
import * as rewriteThis from "./rewrite-this";
import * as rewriteLiveReferences from "./rewrite-live-references";
import * as normalizeAndLoadMetadata from "./normalize-and-load-metadata";
import * as Lazy from "./lazy-modules";
import * as dynamicImport from "./dynamic-import";
import getModuleName from "./get-module-name";

export { buildDynamicImport } from "./dynamic-import";
export { default as getModuleName } from "./get-module-name";
export { hasExports, isSideEffectImport } from "./normalize-and-load-metadata";
export { isModule } from "@babel/helper-module-imports";
export { default as rewriteThis } from "./rewrite-this";

export function rewriteModuleStatementsAndPrepareHeader(path, {
  exportName,
  strict,
  allowTopLevelThis,
  strictMode,
  noInterop,
  importInterop = noInterop ? "none" : "babel",
  lazy = false,
  getWrapperPayload = Lazy.toGetWrapperPayload(lazy),
  wrapReference = Lazy.wrapReference,
  esNamespaceOnly,
  filename,
  constantReexports = arguments[1].loose,
  enumerableModuleMeta = arguments[1].loose,
  noIncompleteNsImportDetection
}) {
  normalizeAndLoadMetadata.validateImportInteropOption(importInterop);
  assert(helperModuleImports.isModule(path), "Cannot process module statements in a script");
  path.node.sourceType = "script";
  const meta = normalizeAndLoadMetadata.default(path, exportName, {
    importInterop,
    initializeReexports: constantReexports,
    getWrapperPayload,
    esNamespaceOnly,
    filename
  });
  if (!allowTopLevelThis) {
    rewriteThis.default(path);
  }
  rewriteLiveReferences.default(path, meta, wrapReference);
  if (strictMode !== false) {
    const hasStrict = path.node.directives.some(directive => directive.value.value === "use strict");
    if (!hasStrict) {
      path.unshiftContainer("directives", t.directive(t.directiveLiteral("use strict")));
    }
  }
  const headers = [];
  if (normalizeAndLoadMetadata.hasExports(meta) && !strict) {
    headers.push(buildESModuleHeader(meta, enumerableModuleMeta));
  }
  const nameList = buildExportNameListDeclaration(path, meta);
  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }
  headers.push(...buildExportInitializationStatements(path, meta, wrapReference, constantReexports, noIncompleteNsImportDetection));
  return {
    meta,
    headers
  };
}

export function ensureStatementsHoisted(statements) {
  statements.forEach(header => {
    header._blockHoist = 3;
  });
}

export function wrapInterop(programPath, expr, type) {
  if (type === "none") {
    return null;
  }
  if (type === "node-namespace") {
    return t.callExpression(programPath.hub.addHelper("interopRequireWildcard"), [expr, t.booleanLiteral(true)]);
  } else if (type === "node-default") {
    return null;
  }
  let helper;
  if (type === "default") {
    helper = "interopRequireDefault";
  } else if (type === "namespace") {
    helper = "interopRequireWildcard";
  } else {
    throw new Error(`Unknown interop: ${type}`);
  }
  return t.callExpression(programPath.hub.addHelper(helper), [expr]);
}

export function buildNamespaceInitStatements(metadata, sourceMetadata, constantReexports = false, wrapReference = Lazy.wrapReference) {
  const statements = [];
  const srcNamespaceId = t.identifier(sourceMetadata.name);
  
  for (const localName of sourceMetadata.importsNamespace) {
    if (localName === sourceMetadata.name) continue;
    statements.push(t.template.statement`var NAME = SOURCE;`({
      NAME: localName,
      SOURCE: t.cloneNode(srcNamespaceId)
    }));
  }
  
  const srcNamespace = wrapReference ? wrapReference(srcNamespaceId, sourceMetadata.wrap) : srcNamespaceId;
  if (constantReexports) {
    statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, true, wrapReference));
  }
  
  for (const exportName of sourceMetadata.reexportNamespace) {
    statements.push(!t.isIdentifier(srcNamespace) ? t.template.statement`
            Object.defineProperty(EXPORTS, "NAME", {
              enumerable: true,
              get: function() {
                return NAMESPACE;
              }
            });
          ` : t.template.statement`EXPORTS.NAME = NAMESPACE;`)({
      EXPORTS: metadata.exportName,
      NAME: exportName,
      NAMESPACE: t.cloneNode(srcNamespace)
    });
  }
  
  if (sourceMetadata.reexportAll) {
    const statement = buildNamespaceReexport(metadata, t.cloneNode(srcNamespace), constantReexports);
    statement.loc = sourceMetadata.reexportAll.loc;
    statements.push(statement);
  }
  
  return statements;
}

function buildESModuleHeader(metadata, enumerableModuleMeta = false) {
  return (enumerableModuleMeta ? t.template.statement`
        EXPORTS.__esModule = true;
      ` : t.template.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true
        });
      `)({
    EXPORTS: metadata.exportName
  });
}

function buildNamespaceReexport(metadata, namespace, constantReexports) {
  return (constantReexports ? t.template.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;
          if (key in EXPORTS && EXPORTS[key] === NAMESPACE[key]) return;

          EXPORTS[key] = NAMESPACE[key];
        });
      ` : t.template.statement`
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
    VERIFY_NAME_LIST: metadata.exportNameListName ? t.template`
            if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;
          `({
      EXPORTS_LIST: metadata.exportNameListName
    }) : null
  });
}

function buildExportNameListDeclaration(programPath, metadata) {
  const exportedVars = Object.create(null);
  
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
  
  if (!hasReexport || Object.keys(exportedVars).length === 0) return null;
  
  const name = programPath.scope.generateUidIdentifier("exportNames");
  delete exportedVars.default;
  
  return {
    name: name.name,
    statement: t.variableDeclaration("var", [t.variableDeclarator(name, t.valueToNode(exportedVars))])
  };
}

function buildExportInitializationStatements(programPath, metadata, wrapReference, constantReexports = false, noIncompleteNsImportDetection = false) {
  const initStatements = [];
  
  for (const [localName, data] of metadata.local) {
    if (data.kind === "import") {

    } else if (data.kind === "hoisted") {
      initStatements.push([data.names[0], buildInitStatement(metadata, data.names, t.identifier(localName))]);
    } else if (!noIncompleteNsImportDetection) {
      for (const exportName of data.names) {
        initStatements.push([exportName, null]);
      }
    }
  }
  
  for (const data of metadata.source.values()) {
    if (!constantReexports) {
      const reexportsStatements = buildReexportsFromMeta(metadata, data, false, wrapReference);
      const reexports = [...data.reexports.keys()];
      
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
  
  initStatements.sort(([a], [b]) => {
    if (a < b) return -1;
    if (b < a) return 1;
    return 0;
  });
  
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
  computed: ({ exports, name, value }) => t.template.expression.ast`${exports}["${name}"] = ${value}`,
  default: ({ exports, name, value }) => t.template.expression.ast`${exports}.${name} = ${value}`,
  define: ({ exports, name, value }) => t.template.expression.ast`
      Object.defineProperty(${exports}, "${name}", {
        enumerable: true,
        value: void 0,
        writable: true
      })["${name}"] = ${value}`
};

function buildInitStatement(metadata, exportNames, initExpr) {
  const { stringSpecifiers, exportName: exports } = metadata;
  
  return t.expressionStatement(exportNames.reduce((value, name) => {
    const params = {
      exports,
      name,
      value
    };
    
    if (name === "__proto__") {
      return InitTemplate.define(params);
    }
    
    if (stringSpecifiers.has(name)) {
      return InitTemplate.computed(params);
    }
    
    return InitTemplate.default(params);
  }, initExpr));
}

//# sourceMappingURL=index.js.map
