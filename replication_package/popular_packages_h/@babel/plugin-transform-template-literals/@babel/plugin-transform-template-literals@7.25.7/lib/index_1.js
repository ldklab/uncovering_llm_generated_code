"use strict";

import { declare } from "@babel/helper-plugin-utils";
import * as babelCore from "@babel/core";

const transformTemplateLiterals = declare((api, options) => {
  api.assertVersion(7);

  const ignoreToPrimitiveHint = api.assumption("ignoreToPrimitiveHint") ?? options.loose;
  const mutableTemplateObject = api.assumption("mutableTemplateObject") ?? options.loose;

  let helperName = "taggedTemplateLiteral";
  if (mutableTemplateObject) helperName += "Loose";

  function buildConcatCallExpressions(items) {
    let concatAvailable = true;
    return items.reduce((left, right) => {
      let canInsert = babelCore.types.isLiteral(right);
      if (!canInsert && concatAvailable) {
        canInsert = true;
        concatAvailable = false;
      }
      if (canInsert && babelCore.types.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }
      return babelCore.types.callExpression(
        babelCore.types.memberExpression(left, babelCore.types.identifier("concat")),
        [right]
      );
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
        let areStringsRawEqual = true;

        for (const elem of quasi.quasis) {
          const { raw, cooked } = elem.value;
          const value = cooked == null ? path.scope.buildUndefinedNode() : babelCore.types.stringLiteral(cooked);
          strings.push(value);
          raws.push(babelCore.types.stringLiteral(raw));
          if (raw !== cooked) {
            areStringsRawEqual = false;
          }
        }

        const helperArgs = [babelCore.types.arrayExpression(strings)];
        if (!areStringsRawEqual) {
          helperArgs.push(babelCore.types.arrayExpression(raws));
        }

        const templateObjectId = path.scope.generateUidIdentifier("templateObject");
        path.scope.getProgramParent().push({ id: babelCore.types.cloneNode(templateObjectId) });

        path.replaceWith(
          babelCore.types.callExpression(node.tag, [
            babelCore.template.expression.ast`
              ${babelCore.types.cloneNode(templateObjectId)} || (
                ${templateObjectId} = ${this.addHelper(helperName)}(${helperArgs})
              )
            `,
            ...quasi.expressions,
          ])
        );
      },

      TemplateLiteral(path) {
        if (path.parent.type === "TSLiteralType") {
          return;
        }

        const nodes = [];
        const expressions = path.get("expressions");
        let exprIndex = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(babelCore.types.stringLiteral(elem.value.cooked));
          }

          if (exprIndex < expressions.length) {
            const exprNode = expressions[exprIndex++].node;
            if (!babelCore.types.isStringLiteral(exprNode, { value: "" })) {
              nodes.push(exprNode);
            }
          }
        }

        if (!babelCore.types.isStringLiteral(nodes[0]) &&
            !(ignoreToPrimitiveHint && babelCore.types.isStringLiteral(nodes[1]))) {
          nodes.unshift(babelCore.types.stringLiteral(""));
        }

        let outputNode = nodes[0];
        if (ignoreToPrimitiveHint) {
          for (let i = 1; i < nodes.length; i++) {
            outputNode = babelCore.types.binaryExpression("+", outputNode, nodes[i]);
          }
        } else if (nodes.length > 1) {
          outputNode = buildConcatCallExpressions(nodes);
        }

        path.replaceWith(outputNode);
      },
    },
  };
});

export default transformTemplateLiterals;

//# sourceMappingURL=index.js.map
