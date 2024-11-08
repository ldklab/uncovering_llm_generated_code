"use strict";

// Import necessary modules from Babel and other utilities
const { declare } = require("@babel/helper-plugin-utils");
const { isRequired } = require("@babel/helper-compilation-targets");
const annotateAsPure = require("@babel/helper-annotate-as-pure").default;
const { types } = require("@babel/core");
const { builtin, browser } = require("globals");
const transformClass = require("./transformClass.js").default;
const { NodePath } = require("@babel/traverse");

// Function to get classes with names starting with uppercase letters
const getBuiltinClasses = (category) => Object.keys(category).filter(name => /^[A-Z]/.test(name));
const builtinClasses = new Set([...getBuiltinClasses(builtin), ...getBuiltinClasses(browser)]);

module.exports = declare((api, options) => {
  api.assertVersion(7); // Ensure Babel version compatibility

  const {
    loose = false
  } = options;

  // Define assumptions to guide transformation behavior
  const setClassMethods = api.assumption("setClassMethods") ?? loose;
  const constantSuper = api.assumption("constantSuper") ?? loose;
  const superIsCallableConstructor = api.assumption("superIsCallableConstructor") ?? loose;
  const noClassCalls = api.assumption("noClassCalls") ?? loose;

  // Determine if support for Unicode identifiers is required
  const supportUnicodeId = !isRequired("transform-unicode-escapes", api.targets());

  const VISITED = new WeakSet(); // Track visited nodes to prevent redundant transformations

  return {
    name: "transform-classes",
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;
        path.splitExportDeclaration ??= NodePath.prototype.splitExportDeclaration;
        path.splitExportDeclaration();
      },
      ClassDeclaration(path) {
        const { node } = path;
        const ref = node.id ? types.cloneNode(node.id) : path.scope.generateUidIdentifier("class");
        path.replaceWith(types.variableDeclaration("let", [types.variableDeclarator(ref, types.toExpression(node))]));
      },
      ClassExpression(path, state) {
        const { node } = path;
        if (VISITED.has(node)) return;

        path.ensureFunctionName ??= NodePath.prototype.ensureFunctionName;
        const replacement = path.ensureFunctionName(supportUnicodeId);
        if (replacement && replacement.node !== node) return;

        VISITED.add(node); // Mark node as visited

        const [replacedPath] = path.replaceWith(transformClass(path, state.file, builtinClasses, loose, {
          setClassMethods,
          constantSuper,
          superIsCallableConstructor,
          noClassCalls
        }, supportUnicodeId));

        // Annotate as pure if the replaced path is a call expression
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
