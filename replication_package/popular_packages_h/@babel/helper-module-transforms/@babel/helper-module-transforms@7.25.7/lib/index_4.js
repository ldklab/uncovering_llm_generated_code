"use strict";

const assert = require("assert");
const babelCore = require("@babel/core");
const helperModuleImports = require("@babel/helper-module-imports");
const rewriteThis = require("./rewrite-this.js");
const rewriteLiveReferences = require("./rewrite-live-references.js");
const normalizeAndLoadMetadata = require("./normalize-and-load-metadata.js");
const Lazy = require("./lazy-modules.js");
const dynamicImport = require("./dynamic-import.js");
const getModuleName = require("./get-module-name.js");

exports.buildDynamicImport = dynamicImport.buildDynamicImport;
exports.getModuleName = getModuleName.default;
exports.hasExports = normalizeAndLoadMetadata.hasExports;
exports.isModule = helperModuleImports.isModule;
exports.isSideEffectImport = normalizeAndLoadMetadata.isSideEffectImport;
exports.rewriteThis = rewriteThis.default;
exports.getDynamicImportSource = dynamicImport.getDynamicImportSource;
exports.rewriteModuleStatementsAndPrepareHeader = rewriteModuleStatementsAndPrepareHeader;
exports.wrapInterop = wrapInterop;

function rewriteModuleStatementsAndPrepareHeader(path, options) {
  const {
    exportName,
    strict,
    allowTopLevelThis,
    strictMode,
    noInterop,
    importInterop = noInterop ? "none" : "babel",
    lazy,
    getWrapperPayload = Lazy.toGetWrapperPayload(lazy !== undefined ? lazy : false),
    wrapReference = Lazy.wrapReference,
    esNamespaceOnly,
    filename,
    constantReexports = options.loose,
    enumerableModuleMeta = options.loose,
    noIncompleteNsImportDetection
  } = options;

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
      path.unshiftContainer("directives", babelCore.types.directive(babelCore.types.directiveLiteral("use strict")));
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
  return { meta, headers };
}

function ensureStatementsHoisted(statements) {
  statements.forEach(header => {
    header._blockHoist = 3;
  });
}

function wrapInterop(programPath, expr, type) {
  if (type === "none") return null;
  let helper;
  if (type === "node-namespace") {
    return babelCore.types.callExpression(programPath.hub.addHelper("interopRequireWildcard"), [expr, babelCore.types.booleanLiteral(true)]);
  } else if (type === "default") {
    helper = "interopRequireDefault";
  } else if (type === "namespace") {
    helper = "interopRequireWildcard";
  } else {
    throw new Error(`Unknown interop: ${type}`);
  }
  return babelCore.types.callExpression(programPath.hub.addHelper(helper), [expr]);
}

function buildNamespaceInitStatements(metadata, sourceMetadata, constantReexports = false, wrapReference = Lazy.wrapReference) {
  const statements = [];
  const srcNamespaceId = babelCore.types.identifier(sourceMetadata.name);

  sourceMetadata.importsNamespace.forEach(localName => {
    if (localName !== sourceMetadata.name) {
      statements.push(babelCore.template.statement`var NAME = SOURCE;`({ NAME: localName, SOURCE: babelCore.types.cloneNode(srcNamespaceId) }));
    }
  });

  const srcNamespace = wrapReference(srcNamespaceId, sourceMetadata.wrap) || srcNamespaceId;

  if (constantReexports) {
    statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, true, wrapReference));
  }

  sourceMetadata.reexportNamespace.forEach(exportName => {
    statements.push(babelCore.template.statement`
      Object.defineProperty(EXPORTS, "NAME", {
        enumerable: true,
        get: function() {
          return NAMESPACE;
        }
      });
    `({
      EXPORTS: metadata.exportName,
      NAME: exportName,
      NAMESPACE: babelCore.types.cloneNode(srcNamespace)
    }));
  });

  if (sourceMetadata.reexportAll) {
    const statement = buildNamespaceReexport(metadata, babelCore.types.cloneNode(srcNamespace), constantReexports);
    statement.loc = sourceMetadata.reexportAll.loc;
    statements.push(statement);
  }
  return statements;
}

function buildReexportsFromMeta(meta, metadata, constantReexports, wrapReference) {
  const {
    stringSpecifiers
  } = meta;

  return Array.from(metadata.reexports, ([exportName, importName]) => {
    let namespaceImport = babelCore.types.cloneNode(babelCore.types.identifier(metadata.name));
    if (importName === "default" && metadata.interop === "node-default") {
      // specific handling can be added here
    } else if (stringSpecifiers.has(importName)) {
      namespaceImport = babelCore.types.memberExpression(namespaceImport, babelCore.types.stringLiteral(importName), true);
    } else {
      namespaceImport = babelCore.types.memberExpression(namespaceImport, babelCore.types.identifier(importName));
    }
    return {
      exports: meta.exportName,
      exportName,
      namespaceImport
    };
  }).map(({ exports, exportName, namespaceImport }) => {
    if (constantReexports || babelCore.types.isIdentifier(namespaceImport)) {
      return ReexportTemplate.constant({
        exports,
        exportName,
        namespaceImport
      });
    } else {
      return ReexportTemplate.spec({
        exports,
        exportName,
        namespaceImport
      });
    }
  });
}

function buildESModuleHeader(metadata, enumerableModuleMeta = false) {
  return (enumerableModuleMeta ? babelCore.template.statement`
    EXPORTS.__esModule = true;
  ` : babelCore.template.statement`
    Object.defineProperty(EXPORTS, "__esModule", {
      value: true,
    });
  `)({
    EXPORTS: metadata.exportName
  });
}

// Other helper functions and templates as before...
