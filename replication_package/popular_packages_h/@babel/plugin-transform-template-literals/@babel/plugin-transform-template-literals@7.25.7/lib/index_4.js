"use strict";

import { declare } from "@babel/helper-plugin-utils";
import * as babelCore from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);
  const ignoreToPrimitiveHint = api.assumption("ignoreToPrimitiveHint") ?? options.loose;
  const mutableTemplateObject = api.assumption("mutableTemplateObject") ?? options.loose;

  let helperName = "taggedTemplateLiteral";
  if (mutableTemplateObject) helperName += "Loose";

  function buildConcatCallExpressions(items) {
    let available = true;
    return items.reduce((left, right) => {
      let canInsert = babelCore.types.isLiteral(right);
      if (!canInsert && available) {
        canInsert = true;
        available = false;
      }
      if (canInsert && babelCore.types.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }
      return babelCore.types.callExpression(
        babelCore.types.memberExpression(left, babelCore.types.identifier("concat")), [right]
      );
    });
  }

  return {
    name: "transform-template-literals",
    visitor: {
      TaggedTemplateExpression(path) {
        const { node } = path;
        const { quasi } = node;
        const strings = [], raws = [];
        let isStringsRawEqual = true;

        for (const elem of quasi.quasis) {
          const { raw, cooked } = elem.value;
          const value = cooked == null ? path.scope.buildUndefinedNode() : babelCore.types.stringLiteral(cooked);
          strings.push(value);
          raws.push(babelCore.types.stringLiteral(raw));
          if (raw !== cooked) {
            isStringsRawEqual = false;
          }
        }

        const helperArgs = [babelCore.types.arrayExpression(strings)];
        if (!isStringsRawEqual) {
          helperArgs.push(babelCore.types.arrayExpression(raws));
        }
        const tmp = path.scope.generateUidIdentifier("templateObject");
        path.scope.getProgramParent().push({
          id: babelCore.types.cloneNode(tmp)
        });
        path.replaceWith(babelCore.types.callExpression(node.tag, [babelCore.template.expression.ast`
          ${babelCore.types.cloneNode(tmp)} || (
            ${tmp} = ${path.addHelper(helperName)}(${helperArgs})
          )
        `, ...quasi.expressions]));
      },
      TemplateLiteral(path) {
        if (path.parent.type === "TSLiteralType") return;

        const nodes = [];
        const expressions = path.get("expressions");
        let index = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(babelCore.types.stringLiteral(elem.value.cooked));
          }
          if (index < expressions.length) {
            const exprNode = expressions[index++].node;
            if (!babelCore.types.isStringLiteral(exprNode, { value: "" })) {
              nodes.push(exprNode);
            }
          }
        }

        if (!babelCore.types.isStringLiteral(nodes[0]) && !(ignoreToPrimitiveHint && babelCore.types.isStringLiteral(nodes[1]))) {
          nodes.unshift(babelCore.types.stringLiteral(""));
        }

        let rootNode = nodes[0];
        if (ignoreToPrimitiveHint) {
          for (let i = 1; i < nodes.length; i++) {
            rootNode = babelCore.types.binaryExpression("+", rootNode, nodes[i]);
          }
        } else if (nodes.length > 1) {
          rootNode = buildConcatCallExpressions(nodes);
        }

        path.replaceWith(rootNode);
      }
    }
  };
});
