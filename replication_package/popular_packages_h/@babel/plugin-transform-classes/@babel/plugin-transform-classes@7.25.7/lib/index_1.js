"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const { isRequired } = require("@babel/helper-compilation-targets");
const annotateAsPure = require("@babel/helper-annotate-as-pure");
const { types } = require("@babel/core");
const globals = require("globals");
const transformClass = require("./transformClass.js");

const getBuiltinClasses = category => Object.keys(globals[category]).filter(name => /^[A-Z]/.test(name));
const builtinClasses = new Set([...getBuiltinClasses("builtin"), ...getBuiltinClasses("browser")]);

var _default = exports.default = declare((api, options) => {
  api.assertVersion(7);

  const { loose = false } = options;
  const setClassMethods = api.assumption("setClassMethods") ?? loose;
  const constantSuper = api.assumption("constantSuper") ?? loose;
  const superIsCallableConstructor = api.assumption("superIsCallableConstructor") ?? loose;
  const noClassCalls = api.assumption("noClassCalls") ?? loose;
  const supportUnicodeId = !isRequired("transform-unicode-escapes", api.targets());
  
  const VISITED = new WeakSet();

  return {
    name: "transform-classes",
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;
        if (!path.splitExportDeclaration) {
          path.splitExportDeclaration = require("@babel/traverse").NodePath.prototype.splitExportDeclaration;
        }
        path.splitExportDeclaration();
      },
      ClassDeclaration(path) {
        const { node } = path;
        const ref = node.id ? types.cloneNode(node.id) : path.scope.generateUidIdentifier("class");
        path.replaceWith(types.variableDeclaration("let", [
          types.variableDeclarator(ref, types.toExpression(node))
        ]));
      },
      ClassExpression(path, state) {
        const { node } = path;
        if (VISITED.has(node)) return;
        if (!path.ensureFunctionName) {
          path.ensureFunctionName = require("@babel/traverse").NodePath.prototype.ensureFunctionName;
        }
        const replacement = path.ensureFunctionName(supportUnicodeId);
        if (replacement && replacement.node !== node) return;

        VISITED.add(node);
        const [replacedPath] = path.replaceWith(transformClass(path, state.file, builtinClasses, loose, {
          setClassMethods,
          constantSuper,
          superIsCallableConstructor,
          noClassCalls
        }, supportUnicodeId));

        if (replacedPath.isCallExpression()) {
          annotateAsPure(replacedPath);
          const callee = replacedPath.get("callee");
          if (callee.isArrowFunctionExpression()) {
            callee.arrowFunctionToExpression();
          }
        }
      }
    }
  };
});
