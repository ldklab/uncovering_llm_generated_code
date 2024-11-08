"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { declare } = require("@babel/helper-plugin-utils");
const {
  isModule,
  rewriteModuleStatementsAndPrepareHeader,
  isSideEffectImport,
  wrapInterop,
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  getModuleName,
} = require("@babel/helper-module-transforms");
const simpleAccess = require("@babel/helper-simple-access").default;
const { template, types } = require("@babel/core");
const { createDynamicImportTransform } = require("babel-plugin-dynamic-import-node/utils");

const transformModulesCommonJS = declare((api, options) => {
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
    allowCommonJSExports = true,
  } = options;

  const validLazy = typeof lazy === "boolean" || typeof lazy === "function" ||
    (Array.isArray(lazy) && lazy.every(item => typeof item === "string"));
  if (!validLazy) throw new Error(`.lazy must be a boolean, array of strings, or a function`);

  if (typeof strictNamespace !== "boolean") throw new Error(`.strictNamespace must be a boolean, or undefined`);
  if (typeof mjsStrictNamespace !== "boolean") throw new Error(`.mjsStrictNamespace must be a boolean, or undefined`);

  const getAssertion = (localName) => template.expression.ast`
    (function(){
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting sourceType:script or sourceType:unambiguous in your Babel config for this file."
      );
    })()
  `;

  const moduleExportsVisitor = {
    ReferencedIdentifier(path) {
      const localName = path.node.name;
      if (!["module", "exports"].includes(localName)) return;
      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      if (rootBinding !== localBinding || path.parentPath.isObjectProperty({ value: path.node }) && path.parentPath.parentPath.isObjectPattern() || path.parentPath.isAssignmentExpression({ left: path.node }) || path.isAssignmentExpression({ left: path.node })) {
        return;
      }
      path.replaceWith(getAssertion(localName));
    },

    AssignmentExpression(path) {
      const left = path.get("left");

      if (left.isIdentifier() || left.isPattern()) {
        const ids = left.isPattern() ? left.getOuterBindingIdentifiers() : { [left.node.name]: left.node };
        const localName = Object.keys(ids).find(local => ["module", "exports"].includes(local) && this.scope.getBinding(local) === path.scope.getBinding(local));
        if (localName) {
          const right = path.get("right");
          right.replaceWith(types.sequenceExpression([right.node, getAssertion(localName)]));
        }
      }
    },
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

          ["exports", "module", "require", "__filename", "__dirname"].forEach(name => path.scope.rename(name));

          if (!allowCommonJSExports) {
            simpleAccess(path, new Set(["module", "exports"]));
            path.traverse(moduleExportsVisitor, { scope: path.scope });
          }

          const moduleName = getModuleName(this.file.opts, options);
          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(path, {
            exportName: "exports",
            loose,
            strict,
            strictMode,
            allowTopLevelThis,
            noInterop,
            lazy,
            esNamespaceOnly: typeof state.filename === "string" && /\.mjs$/.test(state.filename) ? mjsStrictNamespace : strictNamespace,
          });

          for (const [source, metadata] of meta.source) {
            const loadExpr = types.callExpression(types.identifier("require"), [types.stringLiteral(source)]);

            let header;
            if (isSideEffectImport(metadata)) {
              if (metadata.lazy) throw new Error("Assertion failure");
              header = types.expressionStatement(loadExpr);
            } else {
              const init = wrapInterop(path, loadExpr, metadata.interop) || loadExpr;
              header = metadata.lazy ? template.ast`
                function ${metadata.name}() {
                  const data = ${init};
                  ${metadata.name} = function(){ return data; };
                  return data;
                }
              ` : template.ast`
                var ${metadata.name} = ${init};
              `;
            }

            header.loc = metadata.loc;
            headers.push(header);
            headers.push(...buildNamespaceInitStatements(meta, metadata, loose));
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);
        },
      },
    },
  };
});

exports.default = transformModulesCommonJS;
