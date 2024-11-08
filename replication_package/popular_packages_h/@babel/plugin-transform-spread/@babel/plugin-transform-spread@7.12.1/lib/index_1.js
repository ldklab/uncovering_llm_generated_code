"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const { skipTransparentExprWrappers } = require("@babel/helper-skip-transparent-expression-wrappers");
const t = require("@babel/core").types;

module.exports = declare((api, options) => {
  api.assertVersion(7);
  const { loose, allowArrayLike } = options;

  function getSpreadLiteral(spread, scope) {
    if (loose && !t.isIdentifier(spread.argument, { name: "arguments" })) {
      return spread.argument;
    }
    return scope.toArray(spread.argument, true, allowArrayLike);
  }

  function hasSpread(nodes) {
    return nodes.some(node => t.isSpreadElement(node));
  }

  function push(props, nodes) {
    if (props.length) nodes.push(t.arrayExpression(props));
    return [];
  }

  function build(props, scope) {
    const nodes = [];
    let tmpProps = [];
    
    for (const prop of props) {
      if (t.isSpreadElement(prop)) {
        tmpProps = push(tmpProps, nodes);
        nodes.push(getSpreadLiteral(prop, scope));
      } else {
        tmpProps.push(prop);
      }
    }
    
    push(tmpProps, nodes);
    return nodes;
  }

  function transformSpread(path, args, scope) {
    if (!hasSpread(args)) return;

    const nodes = build(args, scope);
    const first = nodes.length ? nodes.shift() : t.arrayExpression([]);

    path.node.arguments = nodes.length ? [t.callExpression(t.memberExpression(first, t.identifier("concat")), nodes)] : [first];

    return first;
  }

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { elements } = path.node;
        if (!hasSpread(elements)) return;

        const nodes = build(elements, path.scope);
        const firstNode = nodes.length ? nodes.shift() : t.arrayExpression([]);
        path.replaceWith(t.callExpression(t.memberExpression(firstNode, t.identifier("concat")), nodes));
      },

      CallExpression(path) {
        const first = transformSpread(path, path.node.arguments, path.scope);
        const calleePath = skipTransparentExprWrappers(path.get("callee"));

        if (!calleePath.isSuper() && calleePath.isMemberExpression()) {
          let obj = calleePath.node.object;
          const temp = path.scope.maybeGenerateMemoised(obj);
          
          if (temp) {
            obj = t.assignmentExpression("=", temp, obj);
          }
          
          path.node.callee = t.memberExpression(calleePath.node, t.identifier("apply"));
          path.node.arguments.unshift(temp || t.cloneNode(obj || t.thisExpression()));
        }
      },

      NewExpression(path) {
        const first = transformSpread(path, path.node.arguments, path.scope);
        path.replaceWith(t.callExpression(path.hub.addHelper("construct"), [path.node.callee, first]));
      }
    }
  };
});
