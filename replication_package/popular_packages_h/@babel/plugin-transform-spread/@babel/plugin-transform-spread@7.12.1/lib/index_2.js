"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { skipTransparentExprWrappers } from "@babel/helper-skip-transparent-expression-wrappers";
import * as t from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7); // Ensure Babel version is compatible
  const { loose, allowArrayLike } = options;

  function getSpreadLiteral(spread, scope) {
    if (loose && !t.types.isIdentifier(spread.argument, { name: "arguments" })) {
      return spread.argument;
    }
    return scope.toArray(spread.argument, true, allowArrayLike);
  }

  function hasSpread(nodes) {
    return nodes.some(node => t.types.isSpreadElement(node));
  }

  function push(props, nodes) {
    if (!props.length) return props;
    nodes.push(t.types.arrayExpression(props));
    return [];
  }

  function build(props, scope) {
    const nodes = [];
    let tempProps = [];

    props.forEach(prop => {
      if (t.types.isSpreadElement(prop)) {
        tempProps = push(tempProps, nodes);
        nodes.push(getSpreadLiteral(prop, scope));
      } else {
        tempProps.push(prop);
      }
    });

    push(tempProps, nodes);
    return nodes;
  }

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { node, scope } = path;
        const elements = node.elements;
        if (!hasSpread(elements)) return;

        const nodes = build(elements, scope);
        let first = nodes[0];

        if (nodes.length === 1 && first !== elements[0].argument) {
          path.replaceWith(first);
          return;
        }

        if (!t.types.isArrayExpression(first)) {
          first = t.types.arrayExpression([]);
        } else {
          nodes.shift();
        }

        path.replaceWith(t.types.callExpression(t.types.memberExpression(first, t.types.identifier("concat")), nodes));
      },

      CallExpression(path) {
        const { node, scope } = path;
        const args = node.arguments;
        if (!hasSpread(args)) return;

        const calleePath = skipTransparentExprWrappers(path.get("callee"));
        if (calleePath.isSuper()) return;

        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];

        let nodes = args.length === 1 && args[0].argument.name === "arguments"
          ? [args[0].argument]
          : build(args, scope);

        const first = nodes.shift();

        if (nodes.length) {
          node.arguments.push(t.types.callExpression(t.types.memberExpression(first, t.types.identifier("concat")), nodes));
        } else {
          node.arguments.push(first);
        }

        const callee = calleePath.node;

        if (calleePath.isMemberExpression()) {
          const temp = scope.maybeGenerateMemoised(callee.object);

          if (temp) {
            callee.object = t.types.assignmentExpression("=", temp, callee.object);
            contextLiteral = temp;
          } else {
            contextLiteral = t.types.cloneNode(callee.object);
          }
        }

        node.callee = t.types.memberExpression(node.callee, t.types.identifier("apply"));

        if (t.types.isSuper(contextLiteral)) {
          contextLiteral = t.types.thisExpression();
        }

        node.arguments.unshift(t.types.cloneNode(contextLiteral));
      },

      NewExpression(path) {
        const { node, scope } = path;
        let args = node.arguments;
        if (!hasSpread(args)) return;

        const nodes = build(args, scope);
        const first = nodes.shift();

        if (nodes.length) {
          args = t.types.callExpression(t.types.memberExpression(first, t.types.identifier("concat")), nodes);
        } else {
          args = first;
        }

        path.replaceWith(t.types.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }
    }
  };
});
