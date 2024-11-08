"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { isRequired } from "@babel/helper-compilation-targets";
import annotateAsPure from "@babel/helper-annotate-as-pure";
import { types } from "@babel/core";
import { builtin as builtinGlobals, browser as browserGlobals } from "globals";
import transformClass from "./transformClass.js";
import { NodePath } from "@babel/traverse";

const getBuiltinClasses = (category) =>
  Object.keys(category).filter((name) => /^[A-Z]/.test(name));

const builtinClasses = new Set([
  ...getBuiltinClasses(builtinGlobals),
  ...getBuiltinClasses(browserGlobals),
]);

export default declare((api, options) => {
  api.assertVersion(7);
  const { loose = false } = options;
  const assumptions = {
    setClassMethods: api.assumption("setClassMethods"),
    constantSuper: api.assumption("constantSuper"),
    superIsCallableConstructor: api.assumption("superIsCallableConstructor"),
    noClassCalls: api.assumption("noClassCalls"),
  };

  Object.keys(assumptions).forEach(
    (key) => (assumptions[key] = assumptions[key] ?? loose)
  );

  const supportUnicodeId = !isRequired(
    "transform-unicode-escapes",
    api.targets()
  );

  const VISITED = new WeakSet();

  return {
    name: "transform-classes",
    visitor: {
      ExportDefaultDeclaration(path) {
        if (path.get("declaration").isClassDeclaration()) {
          path.splitExportDeclaration =
            path.splitExportDeclaration || NodePath.prototype.splitExportDeclaration;
          path.splitExportDeclaration();
        }
      },
      ClassDeclaration(path) {
        const { node } = path;
        const ref = node.id
          ? types.cloneNode(node.id)
          : path.scope.generateUidIdentifier("class");
        path.replaceWith(
          types.variableDeclaration("let", [
            types.variableDeclarator(ref, types.toExpression(node)),
          ])
        );
      },
      ClassExpression(path, state) {
        const { node } = path;
        if (!VISITED.has(node)) {
          path.ensureFunctionName =
            path.ensureFunctionName || NodePath.prototype.ensureFunctionName;
          const replacement = path.ensureFunctionName(supportUnicodeId);
          if (replacement?.node !== node) return;

          VISITED.add(node);
          const [replacedPath] = path.replaceWith(
            transformClass(
              path,
              state.file,
              builtinClasses,
              loose,
              assumptions,
              supportUnicodeId
            )
          );

          if (replacedPath.isCallExpression()) {
            annotateAsPure(replacedPath);
            const callee = replacedPath.get("callee");
            if (callee.isArrowFunctionExpression()) {
              callee.arrowFunctionToExpression();
            }
          }
        }
      },
    },
  };
});
