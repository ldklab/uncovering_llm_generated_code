"use strict";

import { declare } from "@babel/helper-plugin-utils";
import {
  isModule,
  getModuleName,
  rewriteModuleStatementsAndPrepareHeader,
  isSideEffectImport,
  wrapInterop,
  buildNamespaceInitStatements,
  ensureStatementsHoisted
} from "@babel/helper-module-transforms";
import simpleAccess from "@babel/helper-simple-access";
import * as babel from "@babel/core";
import { createDynamicImportTransform } from "babel-plugin-dynamic-import-node/utils";

export default declare((api, options) => {
  api.assertVersion(7);

  const transformImportCall = createDynamicImportTransform(api);
  const {
    loose,
    strictNamespace = false,
    mjsStrictNamespace = true,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    lazy = false,
    allowCommonJSExports = true
  } = options;

  if (typeof lazy !== "boolean" && typeof lazy !== "function" && (!Array.isArray(lazy) || !lazy.every(item => typeof item === "string"))) {
    throw new Error(`.lazy must be a boolean, array of strings, or a function`);
  }

  if (typeof strictNamespace !== "boolean") {
    throw new Error(`.strictNamespace must be a boolean, or undefined`);
  }

  if (typeof mjsStrictNamespace !== "boolean") {
    throw new Error(`.mjsStrictNamespace must be a boolean, or undefined`);
  }

  const getAssertion = localName => babel.template.expression.ast`
    (function(){
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting setting sourceType:script or sourceType:unambiguous in your " +
        "Babel config for this file.");
    })()
  `;

  const moduleExportsVisitor = {
    ReferencedIdentifier(path) {
      const localName = path.node.name;
      if (localName !== "module" && localName !== "exports") return;
      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      if (rootBinding !== localBinding || path.parentPath.isObjectProperty({ value: path.node }) && path.parentPath.parentPath.isObjectPattern() || path.parentPath.isAssignmentExpression({ left: path.node }) || path.isAssignmentExpression({ left: path.node })) {
        return;
      }

      path.replaceWith(getAssertion(localName));
    },

    AssignmentExpression(path) {
      const left = path.get("left");

      if (left.isIdentifier()) {
        const localName = path.node.name;
        if (localName !== "module" && localName !== "exports") return;
        const localBinding = path.scope.getBinding(localName);
        const rootBinding = this.scope.getBinding(localName);
        if (rootBinding !== localBinding) return;
        const right = path.get("right");
        right.replaceWith(babel.types.sequenceExpression([right.node, getAssertion(localName)]));
      } else if (left.isPattern()) {
        const ids = left.getOuterBindingIdentifiers();
        const localName = Object.keys(ids).filter(localName => {
          if (localName !== "module" && localName !== "exports") return false;
          return this.scope.getBinding(localName) === path.scope.getBinding(localName);
        })[0];

        if (localName) {
          const right = path.get("right");
          right.replaceWith(babel.types.sequenceExpression([right.node, getAssertion(localName)]));
        }
      }
    }
  };

  return {
    name: "transform-modules-commonjs",

    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "commonjs");
    },

    visitor: {
      CallExpression(path) {
        if (!this.file.has("@babel/plugin-proposal-dynamic-import")) return;
        if (!path.get("callee").isImport()) return;
        let { scope } = path;

        do {
          scope.rename("require");
        } while (scope = scope.parent);

        transformImportCall(this, path.get("callee"));
      },

      Program: {
        exit(path, state) {
          if (!isModule(path)) return;
          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname");

          if (!allowCommonJSExports) {
            simpleAccess(path, new Set(["module", "exports"]));
            path.traverse(moduleExportsVisitor, {
              scope: path.scope
            });
          }

          let moduleName = getModuleName(this.file.opts, options);
          if (moduleName) moduleName = babel.types.stringLiteral(moduleName);
          const {
            meta,
            headers
          } = rewriteModuleStatementsAndPrepareHeader(path, {
            exportName: "exports",
            loose,
            strict,
            strictMode,
            allowTopLevelThis,
            noInterop,
            lazy,
            esNamespaceOnly: typeof state.filename === "string" && /\.mjs$/.test(state.filename) ? mjsStrictNamespace : strictNamespace
          });

          for (const [source, metadata] of meta.source) {
            const loadExpr = babel.types.callExpression(babel.types.identifier("require"), [babel.types.stringLiteral(source)]);

            let header;

            if (isSideEffectImport(metadata)) {
              if (metadata.lazy) throw new Error("Assertion failure");
              header = babel.types.expressionStatement(loadExpr);
            } else {
              const init = wrapInterop(path, loadExpr, metadata.interop) || loadExpr;

              if (metadata.lazy) {
                header = babel.template.ast`
                  function ${metadata.name}() {
                    const data = ${init};
                    ${metadata.name} = function(){ return data; };
                    return data;
                  }
                `;
              } else {
                header = babel.template.ast`
                  var ${metadata.name} = ${init};
                `;
              }
            }

            header.loc = metadata.loc;
            headers.push(header);
            headers.push(...buildNamespaceInitStatements(meta, metadata, loose));
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);
        }
      }
    }
  };
});
