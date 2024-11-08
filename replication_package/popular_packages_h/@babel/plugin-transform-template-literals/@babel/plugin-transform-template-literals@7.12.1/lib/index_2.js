"use strict";

import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);
  const { loose } = options;
  let helperName = loose ? "taggedTemplateLiteralLoose" : "taggedTemplateLiteral";

  function buildConcatCallExpressions(items) {
    let avail = true;
    return items.reduce((left, right) => {
      let canBeInserted = t.types.isLiteral(right);

      if (!canBeInserted && avail) {
        canBeInserted = true;
        avail = false;
      }

      if (canBeInserted && t.types.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }

      return t.types.callExpression(t.types.memberExpression(left, t.types.identifier("concat")), [right]);
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
        let isStringsRawEqual = true;

        for (const elem of quasi.quasis) {
          const { raw, cooked } = elem.value;
          const value = cooked == null ? path.scope.buildUndefinedNode() : t.types.stringLiteral(cooked);
          strings.push(value);
          raws.push(t.types.stringLiteral(raw));

          if (raw !== cooked) {
            isStringsRawEqual = false;
          }
        }

        const scope = path.scope.getProgramParent();
        const templateObject = scope.generateUidIdentifier("templateObject");
        const helperId = this.addHelper(helperName);
        const callExpressionInput = [t.types.arrayExpression(strings)];

        if (!isStringsRawEqual) {
          callExpressionInput.push(t.types.arrayExpression(raws));
        }

        const lazyLoad = t.template.ast`
          function ${templateObject}() {
            const data = ${t.types.callExpression(helperId, callExpressionInput)};
            ${t.types.cloneNode(templateObject)} = function() { return data };
            return data;
          }
        `;
        scope.path.unshiftContainer("body", lazyLoad);
        path.replaceWith(t.types.callExpression(node.tag, [t.types.callExpression(t.types.cloneNode(templateObject), []), ...quasi.expressions]));
      },

      TemplateLiteral(path) {
        const nodes = [];
        const expressions = path.get("expressions");
        let index = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(t.types.stringLiteral(elem.value.cooked));
          }

          if (index < expressions.length) {
            const expr = expressions[index++];
            const node = expr.node;

            if (!t.types.isStringLiteral(node, { value: "" })) {
              nodes.push(node);
            }
          }
        }

        const considerSecondNode = !loose || !t.types.isStringLiteral(nodes[1]);

        if (!t.types.isStringLiteral(nodes[0]) && considerSecondNode) {
          nodes.unshift(t.types.stringLiteral(""));
        }

        let root = nodes[0];

        if (loose) {
          for (let i = 1; i < nodes.length; i++) {
            root = t.types.binaryExpression("+", root, nodes[i]);
          }
        } else if (nodes.length > 1) {
          root = buildConcatCallExpressions(nodes);
        }

        path.replaceWith(root);
      }
    }
  };
});
