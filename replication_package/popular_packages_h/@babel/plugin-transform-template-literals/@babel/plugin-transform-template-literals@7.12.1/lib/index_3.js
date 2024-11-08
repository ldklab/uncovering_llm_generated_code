"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var { declare } = require("@babel/helper-plugin-utils");
var { types, template } = require("@babel/core");

var _default = declare((api, options) => {
  api.assertVersion(7);
  const { loose } = options;
  let helperName = "taggedTemplateLiteral";
  if (loose) helperName += "Loose";

  function buildConcatCallExpressions(items) {
    let avail = true;
    return items.reduce((left, right) => {
      let canBeInserted = types.isLiteral(right);

      if (!canBeInserted && avail) {
        canBeInserted = true;
        avail = false;
      }

      if (canBeInserted && types.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }

      return types.callExpression(types.memberExpression(left, types.identifier("concat")), [right]);
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
          const value = cooked == null ? path.scope.buildUndefinedNode() : types.stringLiteral(cooked);
          strings.push(value);
          raws.push(types.stringLiteral(raw));

          if (raw !== cooked) {
            isStringsRawEqual = false;
          }
        }

        const scope = path.scope.getProgramParent();
        const templateObject = scope.generateUidIdentifier("templateObject");
        const helperId = this.addHelper(helperName);
        const callExpressionInput = [types.arrayExpression(strings)];

        if (!isStringsRawEqual) {
          callExpressionInput.push(types.arrayExpression(raws));
        }

        const lazyLoad = template.ast`
          function ${templateObject}() {
            const data = ${types.callExpression(helperId, callExpressionInput)};
            ${types.cloneNode(templateObject)} = function() { return data };
            return data;
          }
        `;
        scope.path.unshiftContainer("body", lazyLoad);
        path.replaceWith(types.callExpression(node.tag, [types.callExpression(types.cloneNode(templateObject), []), ...quasi.expressions]));
      },

      TemplateLiteral(path) {
        const nodes = [];
        const expressions = path.get("expressions");
        let index = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(types.stringLiteral(elem.value.cooked));
          }

          if (index < expressions.length) {
            const expr = expressions[index++];
            const node = expr.node;

            if (!types.isStringLiteral(node, { value: "" })) {
              nodes.push(node);
            }
          }
        }

        const considerSecondNode = !loose || !types.isStringLiteral(nodes[1]);

        if (!types.isStringLiteral(nodes[0]) && considerSecondNode) {
          nodes.unshift(types.stringLiteral(""));
        }

        let root = nodes[0];

        if (loose) {
          for (let i = 1; i < nodes.length; i++) {
            root = types.binaryExpression("+", root, nodes[i]);
          }
        } else if (nodes.length > 1) {
          root = buildConcatCallExpressions(nodes);
        }

        path.replaceWith(root);
      }
    }
  };
});

exports.default = _default;
