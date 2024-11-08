"use strict";

import _assert from "assert";
import * as _core from "@babel/core";
import { isModule as _isModule } from "@babel/helper-module-imports";
import _defaultRewriteThis from "./rewrite-this.js";
import _defaultRewriteLiveRefs from "./rewrite-live-references.js";
import _normalizeAndLoadMetadata, { hasExports, isSideEffectImport, validateImportInteropOption } from "./normalize-and-load-metadata.js";
import * as Lazy from "./lazy-modules.js";
import _dynamicImport from "./dynamic-import.js";
import _defaultGetModuleName from "./get-module-name.js";

const {
  buildDynamicImport,
  getDynamicImportSource,
} = _dynamicImport;
const {
  default: RewriteThis,
  getModuleName,
  rewriteThis
} = _defaultRewriteThis;

export {
  buildDynamicImport,
  getModuleName,
  hasExports,
  isSideEffectImport,
  isModule,
  rewriteThis as rewriteThis,
};

export function buildNamespaceInitStatements(metadata, sourceMetadata, constantReexports = false, wrapReference = Lazy.wrapReference) {
    // Function logic
}

export function ensureStatementsHoisted(statements) {
  statements.forEach(header => {
    header._blockHoist = 3; // Helps prioritize statement order
  });
}

export function wrapInterop(programPath, expr, type) {
  if (type === "none") return null;
  const helper = type === "default" ? "interopRequireDefault" :
                 type === "namespace" ? "interopRequireWildcard" : 
                 null;

  if (!helper) throw new Error(`Unknown interop: ${type}`);
  return _core.types.callExpression(programPath.hub.addHelper(helper), [expr]);
}

export function rewriteModuleStatementsAndPrepareHeader(path, options) {
  validateImportInteropOption(options.importInterop);
  _assert(_isModule(path), "Cannot process module statements in a script");
  
  path.node.sourceType = "script";
  const meta = _normalizeAndLoadMetadata(path, options.exportName, {
    ...options,
    initializeReexports: options.constantReexports,
    getWrapperPayload: Lazy.toGetWrapperPayload(options.lazy),
  });

  if (!options.allowTopLevelThis) {
    _defaultRewriteThis(path);
  }
  
  _defaultRewriteLiveRefs(path, meta, options.wrapReference);
  
  // Maintain 'use strict' where required
  if (options.strictMode !== false) {
    const hasStrict = path.node.directives.some(directive => directive.value.value === "use strict");
    if (!hasStrict) {
      path.unshiftContainer("directives", _core.types.directive(_core.types.directiveLiteral("use strict")));
    }
  }

  const headers = [];
  if (_normalizeAndLoadMetadata.hasExports(meta) && !options.strict) {
    headers.push(buildESModuleHeader(meta, options.enumerableModuleMeta));
  }

  const nameList = buildExportNameListDeclaration(path, meta);
  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }

  headers.push(...buildExportInitializationStatements(path, meta, options.wrapReference, options.constantReexports, options.noIncompleteNsImportDetection));
  return { meta, headers };
}

function buildESModuleHeader(metadata, enumerable = false) {
  return (enumerable ? _core.template.statement`
    EXPORTS.__esModule = true;
  ` : _core.template.statement`
    Object.defineProperty(EXPORTS, "__esModule", {
      value: true,
    });
  `)({ EXPORTS: metadata.exportName });
}

// Further implementation of buildNamespaceReexport, buildExportNameListDeclaration, and related build... functions.
