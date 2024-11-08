"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const { types, template } = require("@babel/core");

module.exports = declare((api, options) => {
  api.assertVersion(7);
  const { loose } = options;
  const helperName = loose ? "taggedTemplateLiteralLoose" : "taggedTemplateLiteral";

  function buildConcatCallExpression(items) {
    let canConcat = true;
    return items.reduce((left, right) => {
      const isLiteral = types.isLiteral(right);
      if (!isLiteral && canConcat) {
        canConcat = false;
      }

      if (isLiteral && types.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }

      return types.callExpression(
        types.memberExpression(left, types.identifier("concat")),
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
        let rawEqual = true;

        for (const elem of quasi.quasis) {
          const { raw, cooked } = elem.value;
          strings.push(cooked == null ? path.scope.buildUndefinedNode() : types.stringLiteral(cooked));
          raws.push(types.stringLiteral(raw));

          if (raw !== cooked) {
            rawEqual = false;
          }
        }

        const programScope = path.scope.getProgramParent();
        const templateId = programScope.generateUidIdentifier("templateObject");
        const helperId = this.addHelper(helperName);
        const templateCall = [
          types.arrayExpression(strings),
        ];

        if (!rawEqual) {
          templateCall.push(types.arrayExpression(raws));
        }

        const templateFactory = template.ast`
          function ${templateId}() {
            const data = ${types.callExpression(helperId, templateCall)};
            ${templateId} = function() { return data };
            return data;
          }
        `;
        programScope.path.unshiftContainer("body", templateFactory);

        path.replaceWith(
          types.callExpression(node.tag, [
            types.callExpression(types.cloneNode(templateId), []),
            ...quasi.expressions
          ])
        );
      },

      TemplateLiteral(path) {
        const literals = [];
        const expressions = path.get("expressions");
        let exprIndex = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            literals.push(types.stringLiteral(elem.value.cooked));
          }

          if (exprIndex < expressions.length) {
            const expression = expressions[exprIndex++].node;
            if (!types.isStringLiteral(expression, { value: "" })) {
              literals.push(expression);
            }
          }
        }

        const considerLiteral = !loose || !types.isStringLiteral(literals[1]);

        if (!types.isStringLiteral(literals[0]) && considerLiteral) {
          literals.unshift(types.stringLiteral(""));
        }

        let result = literals[0];

        if (loose) {
          for (let i = 1; i < literals.length; i++) {
            result = types.binaryExpression("+", result, literals[i]);
          }
        } else if (literals.length > 1) {
          result = buildConcatCallExpression(literals);
        }

        path.replaceWith(result);
      }
    }
  };
});
