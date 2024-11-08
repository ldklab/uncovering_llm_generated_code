"use strict";

import { declare } from "@babel/helper-plugin-utils";
import * as babel from "@babel/core";
import { transformDynamicImport } from "./dynamic-import.js";
import { lazyImportsHook } from "./lazy.js";
import { defineCommonJSHook, makeInvokers } from "./hooks.js";

export default declare((api, options) => {
  api.assertVersion(7);

  const {
    strictNamespace = false,
    mjsStrictNamespace = strictNamespace,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    importInterop,
    lazy = false,
    allowCommonJSExports = true,
    loose = false,
  } = options;

  const constantReexports = api.assumption("constantReexports") ?? loose;
  const enumerableModuleMeta = api.assumption("enumerableModuleMeta") ?? loose;
  const noIncompleteNsImportDetection = api.assumption("noIncompleteNsImportDetection") ?? false;

  validateOptions({ lazy, strictNamespace, mjsStrictNamespace });

  function validateOptions({ lazy, strictNamespace, mjsStrictNamespace }) {
    if (typeof lazy !== "boolean" && typeof lazy !== "function" && !Array.isArray(lazy)) {
      throw new Error(`.lazy must be a boolean, array of strings, or a function`);
    }
    if (typeof strictNamespace !== "boolean") {
      throw new Error(`.strictNamespace must be a boolean, or undefined`);
    }
    if (typeof mjsStrictNamespace !== "boolean") {
      throw new Error(`.mjsStrictNamespace must be a boolean, or undefined`);
    }
  }

  const getAssertion = localName => babel.template.expression.ast`
    (function() {
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting sourceType:script or sourceType:unambiguous in your Babel config for this file."
      );
    })()
  `;

  const moduleExportsVisitor = {
    ReferencedIdentifier(path) {
      attemptReplacement(path, "module", "exports", getAssertion);
    },
    UpdateExpression(path) {
      attemptUpdateReplacement(path, "module", "exports", getAssertion);
    },
    AssignmentExpression(path) {
      attemptAssignmentReplacement(path, "module", "exports", getAssertion);
    },
  };

  function attemptReplacement(path, ...names) {
    const localName = path.node.name;
    if (!names.includes(localName)) return;

    const localBinding = path.scope.getBinding(localName);
    const rootBinding = path.scope.getBinding(localName);
    if (rootBinding !== localBinding) return;

    if (
      path.parentPath.isObjectProperty({ value: path.node }) &&
      path.parentPath.parentPath.isObjectPattern() ||
      path.parentPath.isAssignmentExpression({ left: path.node }) ||
      path.isAssignmentExpression({ left: path.node })
    ) {
      return;
    }

    path.replaceWith(getAssertion(localName));
  }

  function attemptUpdateReplacement(path, ...names) {
    const arg = path.get("argument");
    if (!arg.isIdentifier()) return;

    const localName = arg.node.name;
    if (!names.includes(localName)) return;

    const localBinding = path.scope.getBinding(localName);
    const rootBinding = this.scope.getBinding(localName);
    if (rootBinding !== localBinding) return;

    path.replaceWith(
      babel.types.assignmentExpression(path.node.operator[0] + "=", arg.node, getAssertion(localName))
    );
  }

  function attemptAssignmentReplacement(path, ...names) {
    const left = path.get("left");
    if (left.isIdentifier()) {
      attemptReplacement(path, ...names);
    } else if (left.isPattern()) {
      const ids = left.getOuterBindingIdentifiers();
      const localName = Object.keys(ids).find(name =>
        this.scope.getBinding(name) === path.scope.getBinding(name)
      );

      if (localName) {
        const right = path.get("right");
        right.replaceWith(babel.types.sequenceExpression([right.node, getAssertion(localName)]));
      }
    }
  }

  return {
    name: "transform-modules-commonjs",

    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "commonjs");
      if (lazy) defineCommonJSHook(this.file, lazyImportsHook(lazy));
    },

    visitor: {
      ["CallExpression" + (api.types.importExpression ? "|ImportExpression" : "")](path) {
        if (!this.file.has("@babel/plugin-proposal-dynamic-import")) return;
        if (path.isCallExpression() && !babel.types.isImport(path.node.callee)) return;

        let { scope } = path;
        do {
          scope.rename("require");
        } while ((scope = scope.parent));

        transformDynamicImport(path, noInterop, this.file);
      },

      Program: {
        exit(path, state) {
          if (!babel.helperModuleTransforms.isModule(path)) return;

          updateScopeBindings(path, ["exports", "module", "require", "__filename", "__dirname"]);

          if (!allowCommonJSExports) {
            babel.helperSimpleAccess.default(path, new Set(["module", "exports"]), false);
            path.traverse(moduleExportsVisitor, { scope: path.scope });
          }

          const moduleName = babel.helperModuleTransforms.getModuleName(this.file.opts, options);
          const moduleNameLiteral = moduleName ? babel.types.stringLiteral(moduleName) : undefined;
          const hooks = makeInvokers(this.file);

          const { meta, headers } = babel.helperModuleTransforms.rewriteModuleStatementsAndPrepareHeader(path, {
            exportName: "exports",
            constantReexports,
            enumerableModuleMeta,
            strict,
            strictMode,
            allowTopLevelThis,
            noInterop,
            importInterop,
            wrapReference: hooks.wrapReference,
            getWrapperPayload: hooks.getWrapperPayload,
            esNamespaceOnly: typeof state.filename === "string" && /\.mjs$/.test(state.filename) ? mjsStrictNamespace : strictNamespace,
            noIncompleteNsImportDetection,
            filename: this.file.opts.filename,
          });

          processSourceModules(meta, headers, hooks, path);

          babel.helperModuleTransforms.ensureStatementsHoisted(headers);
          prependHeadersToFile(headers, path);
        },
      },
    },
  };

  function updateScopeBindings(path, bindings) {
    bindings.forEach(binding => path.scope.rename(binding));
  }

  function processSourceModules(meta, headers, hooks, path) {
    for (const [source, metadata] of meta.source) {
      const loadExpr = babel.types.callExpression(babel.types.identifier("require"), [
        babel.types.stringLiteral(source),
      ]);

      let header;
      if (babel.helperModuleTransforms.isSideEffectImport(metadata)) {
        if (hasLazyEvaluation(metadata)) throw new Error("Assertion failure");

        header = babel.types.expressionStatement(loadExpr);
      } else {
        header = processModuleWrap(metadata, loadExpr, hooks, path);
      }

      if (header) {
        header.loc = metadata.loc;
        headers.push(...assembleHeaders(header, meta, metadata, hooks));
      }
    }
  }

  function processModuleWrap(metadata, loadExpr, hooks, path) {
    const init = babel.helperModuleTransforms.wrapInterop(path, loadExpr, metadata.interop) || loadExpr;
    const header =
      metadata.wrap && hooks.buildRequireWrapper(metadata.name, init, metadata.wrap, metadata.referenced) !== false
        ? null
        : babel.template.statement.ast`var ${metadata.name} = ${init};`;

    return header;
  }

  function hasLazyEvaluation(metadata) {
    return lazy && metadata.wrap === "function";
  }

  function assembleHeaders(header, meta, metadata, hooks) {
    const headers = [header];
    headers.push(...babel.helperModuleTransforms.buildNamespaceInitStatements(meta, metadata, constantReexports, hooks.wrapReference));
    return headers;
  }

  function prependHeadersToFile(headers, path) {
    path.unshiftContainer("body", headers);
    path.get("body").forEach(subPath => {
      if (headers.includes(subPath.node) && subPath.isVariableDeclaration()) {
        subPath.scope.registerDeclaration(subPath);
      }
    });
  }
});

//# sourceMappingURL=index.js.map
