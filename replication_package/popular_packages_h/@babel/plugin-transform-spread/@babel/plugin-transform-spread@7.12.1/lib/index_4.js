"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const { skipTransparentExprWrappers } = require("@babel/helper-skip-transparent-expression-wrappers");
const { types } = require("@babel/core");

function getSpreadLiteral(spread, scope, loose, allowArrayLike) {
  if (loose && !types.isIdentifier(spread.argument, { name: "arguments" })) {
    return spread.argument;
  }
  return scope.toArray(spread.argument, true, allowArrayLike);
}

function hasSpread(nodes) {
  return nodes.some(node => types.isSpreadElement(node));
}

function push(props, nodes) {
  if (props.length) {
    nodes.push(types.arrayExpression(props));
  }
  return [];
}

function build(props, scope, loose, allowArrayLike) {
  const nodes = [];
  let currentProps = [];
  for (const prop of props) {
    if (types.isSpreadElement(prop)) {
      currentProps = push(currentProps, nodes);
      nodes.push(getSpreadLiteral(prop, scope, loose, allowArrayLike));
    } else {
      currentProps.push(prop);
    }
  }
  push(currentProps, nodes);
  return nodes;
}

const plugin = declare((api, options) => {
  api.assertVersion(7);
  const { loose, allowArrayLike } = options;

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.elements)) return;
        const nodes = build(node.elements, scope, loose, allowArrayLike);
        let newNode = nodes[0];
        if (nodes.length === 1 && newNode !== node.elements[0].argument) {
          path.replaceWith(newNode);
          return;
        }
        if (!types.isArrayExpression(newNode)) {
          newNode = types.arrayExpression([]);
        } else {
          nodes.shift();
        }
        path.replaceWith(types.callExpression(types.memberExpression(newNode, types.identifier("concat")), nodes));
      },
      CallExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.arguments)) return;
        const calleePath = skipTransparentExprWrappers(path.get("callee"));
        if (calleePath.isSuper()) return;

        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];
        let nodes;
        if (node.arguments.length === 1 && node.arguments[0].argument.name === "arguments") {
          nodes = [node.arguments[0].argument];
        } else {
          nodes = build(node.arguments, scope, loose, allowArrayLike);
        }

        const first = nodes.shift();
        if (nodes.length) {
          node.arguments.push(types.callExpression(types.memberExpression(first, types.identifier("concat")), nodes));
        } else {
          node.arguments.push(first);
        }

        const callee = calleePath.node;
        if (calleePath.isMemberExpression()) {
          const temp = scope.maybeGenerateMemoised(callee.object);
          if (temp) {
            callee.object = types.assignmentExpression("=", temp, callee.object);
            contextLiteral = temp;
          } else {
            contextLiteral = types.cloneNode(callee.object);
          }
        }

        node.callee = types.memberExpression(node.callee, types.identifier("apply"));
        if (types.isSuper(contextLiteral)) {
          contextLiteral = types.thisExpression();
        }
        node.arguments.unshift(types.cloneNode(contextLiteral));
      },
      NewExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.arguments)) return;

        const nodes = build(node.arguments, scope, loose, allowArrayLike);
        const first = nodes.shift();
        const args = nodes.length ? 
          types.callExpression(types.memberExpression(first, types.identifier("concat")), nodes) :
          first;
        path.replaceWith(types.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }
    }
  };
});

module.exports = plugin;
