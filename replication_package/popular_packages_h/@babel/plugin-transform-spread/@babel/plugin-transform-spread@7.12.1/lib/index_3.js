"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { skipTransparentExprWrappers } from "@babel/helper-skip-transparent-expression-wrappers";
import * as t from "@babel/core";

export default declare((api, options) => {
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
    if (props.length) {
      nodes.push(t.arrayExpression(props));
    }
    return [];
  }

  function build(props, scope) {
    const nodes = [];
    let acc = [];

    for (const prop of props) {
      if (t.isSpreadElement(prop)) {
        acc = push(acc, nodes);
        nodes.push(getSpreadLiteral(prop, scope));
      } else {
        acc.push(prop);
      }
    }

    push(acc, nodes);
    return nodes;
  }

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { elements, scope } = path.node;
        if (!hasSpread(elements)) return;

        const nodes = build(elements, scope);
        let first = nodes[0];

        if (nodes.length === 1 && first !== elements[0].argument) {
          path.replaceWith(first);
          return;
        }

        if (!t.isArrayExpression(first)) {
          first = t.arrayExpression([]);
        } else {
          nodes.shift();
        }

        path.replaceWith(t.callExpression(t.memberExpression(first, t.identifier("concat")), nodes));
      },

      CallExpression(path) {
        const { node, scope } = path;
        const args = node.arguments;
        if (!hasSpread(args)) return;

        const calleePath = skipTransparentExprWrappers(path.get("callee"));
        if (calleePath.isSuper()) return;

        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];
        const nodes = args.length === 1 && args[0].argument.name === "arguments" ? [args[0].argument] : build(args, scope);
        const first = nodes.shift();

        if (nodes.length) {
          node.arguments.push(t.callExpression(t.memberExpression(first, t.identifier("concat")), nodes));
        } else {
          node.arguments.push(first);
        }

        if (calleePath.isMemberExpression()) {
          const temp = scope.maybeGenerateMemoised(calleePath.node.object);
          if (temp) {
            calleePath.node.object = t.assignmentExpression("=", temp, calleePath.node.object);
            contextLiteral = temp;
          } else {
            contextLiteral = t.cloneNode(calleePath.node.object);
          }
        }

        node.callee = t.memberExpression(node.callee, t.identifier("apply"));
        if (t.isSuper(contextLiteral)) contextLiteral = t.thisExpression();
        node.arguments.unshift(t.cloneNode(contextLiteral));
      },

      NewExpression(path) {
        const { node, scope } = path;
        let args = node.arguments;
        if (!hasSpread(args)) return;

        const nodes = build(args, scope);
        const first = nodes.shift();
        args = nodes.length ? t.callExpression(t.memberExpression(first, t.identifier("concat")), nodes) : first;

        path.replaceWith(t.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }
    }
  };
});
