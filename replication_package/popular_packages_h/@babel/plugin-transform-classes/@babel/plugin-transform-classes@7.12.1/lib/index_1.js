"use strict";

import { declare } from "@babel/helper-plugin-utils";
import annotateAsPure from "@babel/helper-annotate-as-pure";
import functionNameHelper from "@babel/helper-function-name";
import splitExportDeclaration from "@babel/helper-split-export-declaration";
import { types } from "@babel/core";
import globals from "globals";
import transformClass from "./transformClass";

const getBuiltinClasses = category => Object.keys(globals[category]).filter(name => /^[A-Z]/.test(name));

const builtinClasses = new Set([...getBuiltinClasses("builtin"), ...getBuiltinClasses("browser")]);

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

export default transformClassesPlugin;
