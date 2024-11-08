"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { isRequired } from "@babel/helper-compilation-targets";
import annotateAsPure from "@babel/helper-annotate-as-pure";
import { types as t } from "@babel/core";
import { builtin as globalsBuiltin, browser as globalsBrowser } from "globals";
import transformClass from "./transformClass.js";

const getBuiltinClasses = category => Object.keys(category).filter(name => /^[A-Z]/.test(name));
const builtinClasses = new Set([...getBuiltinClasses(globalsBuiltin), ...getBuiltinClasses(globalsBrowser)]);

const plugin = declare((api, options) => {
  api.assertVersion(7);

  const {
    loose = false
  } = options;

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
        path.splitExportDeclaration ??= require("@babel/traverse").NodePath.prototype.splitExportDeclaration;
        path.splitExportDeclaration();
      },
      ClassDeclaration(path) {
        const { node } = path;
        const ref = node.id ? t.cloneNode(node.id) : path.scope.generateUidIdentifier("class");
        path.replaceWith(t.variableDeclaration("let", [t.variableDeclarator(ref, t.toExpression(node))]));
      },
      ClassExpression(path, state) {
        const { node } = path;
        if (VISITED.has(node)) return;
        
        path.ensureFunctionName ??= require("@babel/traverse").NodePath.prototype.ensureFunctionName;
        const replacement = path.ensureFunctionName(supportUnicodeId);

        if (replacement && replacement.node !== node) return;
        
        VISITED.add(node);

        const [replacedPath] = path.replaceWith(
          transformClass(path, state.file, builtinClasses, loose, {
            setClassMethods,
            constantSuper,
            superIsCallableConstructor,
            noClassCalls
          }, supportUnicodeId)
        );

        if (replacedPath?.isCallExpression()) {
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

export default plugin;
