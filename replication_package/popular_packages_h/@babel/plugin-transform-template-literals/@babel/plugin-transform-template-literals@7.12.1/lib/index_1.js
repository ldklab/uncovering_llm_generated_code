"use strict";

import { declare } from "@babel/helper-plugin-utils";
import * as babel from "@babel/core";

function buildConcatCallExpressions(items) {
  let canInsert = true;
  
  return items.reduce((left, right) => {
    let isLiteral = babel.types.isLiteral(right);

    if (!isLiteral && canInsert) {
      isLiteral = true;
      canInsert = false;
    }

    if (isLiteral && babel.types.isCallExpression(left)) {
      left.arguments.push(right);
      return left;
    }

    return babel.types.callExpression(
      babel.types.memberExpression(left, babel.types.identifier("concat")),
      [right]
    );
  });
}

export default declare((api, { loose }) => {
  api.assertVersion(7);

  const helperName = loose ? "taggedTemplateLiteralLoose" : "taggedTemplateLiteral";

  return {
    name: "transform-template-literals",
    visitor: {
      TaggedTemplateExpression(path) {
        const { node } = path;
        const { quasis } = node;
        const strings = [];
        const raws = [];
        let areStringsEqual = true;

        for (const elem of quasis) {
          const { raw, cooked } = elem.value;
          const value = cooked == null ? path.scope.buildUndefinedNode() : babel.types.stringLiteral(cooked);
          strings.push(value);
          raws.push(babel.types.stringLiteral(raw));

          if (raw !== cooked) areStringsEqual = false;
        }

        const scope = path.scope.getProgramParent();
        const templateId = scope.generateUidIdentifier("templateObject");
        const helperId = this.addHelper(helperName);
        const args = [babel.types.arrayExpression(strings)];

        if (!areStringsEqual) {
          args.push(babel.types.arrayExpression(raws));
        }

        const lazyTemplateFunction = babel.template.ast`
          function ${templateId}() {
            const data = ${babel.types.callExpression(helperId, args)};
            ${babel.types.cloneNode(templateId)} = () => data;
            return data;
          }
        `;

        scope.path.unshiftContainer("body", lazyTemplateFunction);
        path.replaceWith(babel.types.callExpression(node.tag, [
          babel.types.callExpression(babel.types.cloneNode(templateId), []),
          ...node.quasi.expressions
        ]));
      },

      TemplateLiteral(path) {
        const nodes = [];
        const expressions = path.get("expressions");
        let index = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(babel.types.stringLiteral(elem.value.cooked));
          }

          if (index < expressions.length) {
            const expr = expressions[index++];

            if (!babel.types.isStringLiteral(expr.node, { value: "" })) {
              nodes.push(expr.node);
            }
          }
        }

        const shouldPrependEmptyString = !loose || !babel.types.isStringLiteral(nodes[1]);

        if (!babel.types.isStringLiteral(nodes[0]) && shouldPrependEmptyString) {
          nodes.unshift(babel.types.stringLiteral(""));
        }

        let rootExpression = nodes[0];

        if (loose) {
          for (let i = 1; i < nodes.length; i++) {
            rootExpression = babel.types.binaryExpression("+", rootExpression, nodes[i]);
          }
        } else if (nodes.length > 1) {
          rootExpression = buildConcatCallExpressions(nodes);
        }

        path.replaceWith(rootExpression);
      }
    }
  };
});
