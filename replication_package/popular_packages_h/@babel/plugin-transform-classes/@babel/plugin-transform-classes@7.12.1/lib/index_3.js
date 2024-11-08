"use strict";

import { declare } from "@babel/helper-plugin-utils";
import annotateAsPure from "@babel/helper-annotate-as-pure";
import functionName from "@babel/helper-function-name";
import splitExportDeclaration from "@babel/helper-split-export-declaration";
import { types as t, core as babelCore } from "@babel/core";
import globals from "globals";
import transformClass from "./transformClass";

// Helper function to get classes from the globals' list by category
const getBuiltinClasses = category => 
  Object.keys(globals[category]).filter(name => /^[A-Z]/.test(name));

// Precompute built-in classes set from globals
const builtinClasses = new Set([
  ...getBuiltinClasses("builtin"), 
  ...getBuiltinClasses("browser")
]);

// Babel plugin definition
export default declare((api, options) => {
  api.assertVersion(7); // Ensure we're using Babel API version 7

  const { loose } = options; // Extract the 'loose' option
  const VISITED = Symbol(); // Internal symbol to track visited nodes

  return {
    name: "transform-classes",
    visitor: {
      // Transform default exports involving class declarations
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;
        splitExportDeclaration(path);
      },

      // Transform class declarations to variable declarations
      ClassDeclaration(path) {
        const { node } = path;
        const ref = node.id || path.scope.generateUidIdentifier("class");
        path.replaceWith(t.variableDeclaration("let", [
          t.variableDeclarator(ref, t.toExpression(node))
        ]));
      },

      // Handle class expressions and apply specific transformations
      ClassExpression(path, state) {
        const { node } = path;
        if (node[VISITED]) return; // Skip if already visited
        const inferred = functionName(path);

        if (inferred && inferred !== node) {
          path.replaceWith(inferred);
          return;
        }

        node[VISITED] = true; // Mark node as visited
        path.replaceWith(
          transformClass(path, state.file, builtinClasses, loose)
        );

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
