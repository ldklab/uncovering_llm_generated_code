"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { types as t, template as tpl } from "@babel/core";

const transformTemplateLiterals = declare((api, options) => {
  api.assertVersion(7);

  const ignoreToPrimitiveHint = api.assumption("ignoreToPrimitiveHint") ?? options.loose;
  const mutableTemplateObject = api.assumption("mutableTemplateObject") ?? options.loose;
  
  let helperName = "taggedTemplateLiteral" + (mutableTemplateObject ? "Loose" : "");

  function concatenateExpressions(items) {
    let available = true;
    return items.reduce((left, right) => {
      let canInsert = t.isLiteral(right);
      if (!canInsert && available) {
        canInsert = true;
        available = false;
      }
      if (canInsert && t.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }
      return t.callExpression(t.memberExpression(left, t.identifier("concat")), [right]);
    });
  }

  return {
    name: "transform-template-literals",
    visitor: {
      TaggedTemplateExpression(path) {
        const { node } = path;
        const { quasi } = node;
        
        const strings = [];
        const raws = [];
        let rawsEqual = true;
        
        for (const elem of quasi.quasis) {
          const { cooked, raw } = elem.value;
          const value = cooked == null ? path.scope.buildUndefinedNode() : t.stringLiteral(cooked);
          strings.push(value);
          raws.push(t.stringLiteral(raw));
          if (raw !== cooked) rawsEqual = false;
        }
        
        const helperArgs = [t.arrayExpression(strings)];
        if (!rawsEqual) helperArgs.push(t.arrayExpression(raws));

        const templateUid = path.scope.generateUidIdentifier("templateObject");
        path.scope.getProgramParent().push({ id: t.cloneNode(templateUid) });
        path.replaceWith(t.callExpression(node.tag, [
          tpl.expression.ast`${t.cloneNode(templateUid)} || (${templateUid} = ${this.addHelper(helperName)}(${helperArgs}))`,
          ...quasi.expressions
        ]));
      },

      TemplateLiteral(path) {
        if (path.parent.type === "TSLiteralType") return;

        const nodes = [];
        const expressions = path.get("expressions");
        let index = 0;
        
        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(t.stringLiteral(elem.value.cooked));
          }
          if (index < expressions.length) {
            const expr = expressions[index++];
            const node = expr.node;
            if (!t.isStringLiteral(node, { value: "" })) {
              nodes.push(node);
            }
          }
        }

        if (!t.isStringLiteral(nodes[0]) && !(ignoreToPrimitiveHint && t.isStringLiteral(nodes[1]))) {
          nodes.unshift(t.stringLiteral(""));
        }

        let result = nodes[0];
        
        if (ignoreToPrimitiveHint) {
          for (let i = 1; i < nodes.length; i++) {
            result = t.binaryExpression("+", result, nodes[i]);
          }
        } else if (nodes.length > 1) {
          result = concatenateExpressions(nodes);
        }

        path.replaceWith(result);
      }
    }
  };
});

export default transformTemplateLiterals;
