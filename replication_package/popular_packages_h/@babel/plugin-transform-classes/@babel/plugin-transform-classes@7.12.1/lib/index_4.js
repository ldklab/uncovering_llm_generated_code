"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const annotateAsPure = require("@babel/helper-annotate-as-pure").default;
const functionNameHelper = require("@babel/helper-function-name").default;
const splitExportDeclaration = require("@babel/helper-split-export-declaration").default;
const { types } = require("@babel/core");
const globals = require("globals").default;
const transformClass = require("./transformClass").default;

const _interopRequireDefault = (obj) => obj && obj.__esModule ? obj : { default: obj };

const getBuiltinClasses = (category) => {
  return Object.keys(globals[category]).filter(name => /^[A-Z]/.test(name));
};

const builtinClasses = new Set([
  ...getBuiltinClasses("builtin"),
  ...getBuiltinClasses("browser")
]);

const transformClassesPlugin = declare((api, options) => {
  api.assertVersion(7);

  const { loose } = options;
  const VISITED = Symbol();

  return {
    name: "transform-classes",
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;
        splitExportDeclaration(path);
      },

      ClassDeclaration(path) {
        const { node } = path;
        const ref = node.id || path.scope.generateUidIdentifier("class");
        path.replaceWith(types.variableDeclaration("let", [types.variableDeclarator(ref, types.toExpression(node))]));
      },

      ClassExpression(path, state) {
        const { node } = path;
        if (node[VISITED]) return;
        const inferred = functionNameHelper(path);

        if (inferred && inferred !== node) {
          path.replaceWith(inferred);
          return;
        }

        node[VISITED] = true;
        path.replaceWith(transformClass(path, state.file, builtinClasses, loose));

        if (path.isCallExpression()) {
          annotateAsPure(path);

          if (path.get("callee").isArrowFunctionExpression()) {
            path.get("callee").arrowFunctionToExpression();
          }
        }
      }
    }
  };
});

exports.default = transformClassesPlugin;
