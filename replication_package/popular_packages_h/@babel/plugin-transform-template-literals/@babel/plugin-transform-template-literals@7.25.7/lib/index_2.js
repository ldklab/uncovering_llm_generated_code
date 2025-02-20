"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var { declare } = require("@babel/helper-plugin-utils");
var { types, template } = require("@babel/core");

exports.default = declare((api, options) => {
  api.assertVersion(7);

  const ignoreToPrimitiveHint = api.assumption("ignoreToPrimitiveHint") ?? options.loose;
  const mutableTemplateObject = api.assumption("mutableTemplateObject") ?? options.loose;
  let helperName = mutableTemplateObject ? "taggedTemplateLiteralLoose" : "taggedTemplateLiteral";

  function buildConcatCallExpressions(items) {
    let canInsert = true;
    return items.reduce((left, right) => {
      const literalRight = types.isLiteral(right);
      if (!literalRight && canInsert) {
        canInsert = false;
      }
      
      if ((literalRight || canInsert) && types.isCallExpression(left)) {
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
          const cookedVal = cooked == null ? path.scope.buildUndefinedNode() : types.stringLiteral(cooked);
          strings.push(cookedVal);
          raws.push(types.stringLiteral(raw));
          if (raw !== cooked) isStringsRawEqual = false;
        }

        const helperArgs = [types.arrayExpression(strings)];
        if (!isStringsRawEqual) {
          helperArgs.push(types.arrayExpression(raws));
        }

        const tmp = path.scope.generateUidIdentifier("templateObject");
        path.scope.getProgramParent().push({
          id: types.cloneNode(tmp)
        });

        path.replaceWith(types.callExpression(node.tag, [
          template.expression.ast`
            ${types.cloneNode(tmp)} || (
              ${tmp} = ${this.addHelper(helperName)}(${helperArgs})
            )
          `, 
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
            nodes.push(types.stringLiteral(elem.value.cooked));
          }
          
          if (index < expressions.length) {
            const expr = expressions[index++].node;
            if (!types.isStringLiteral(expr, { value: "" })) {
              nodes.push(expr);
            }
          }
        }

        if (!types.isStringLiteral(nodes[0]) && !(ignoreToPrimitiveHint && types.isStringLiteral(nodes[1]))) {
          nodes.unshift(types.stringLiteral(""));
        }

        let root = nodes[0];

        if (ignoreToPrimitiveHint) {
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

//# sourceMappingURL=index.js.map
