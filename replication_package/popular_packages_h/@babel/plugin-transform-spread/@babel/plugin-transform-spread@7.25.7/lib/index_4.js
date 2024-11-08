"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const helperPluginUtils = require("@babel/helper-plugin-utils");
const helperSkipTransparentExpressionWrappers = require("@babel/helper-skip-transparent-expression-wrappers");
const core = require("@babel/core");

exports.default = helperPluginUtils.declare((api, options) => {
  api.assertVersion(7);

  const iterableIsArray = api.assumption("iterableIsArray") ?? options.loose;
  const arrayLikeIsIterable = options.allowArrayLike ?? api.assumption("arrayLikeIsIterable");

  const getSpreadLiteral = (spread, scope) => {
    if (iterableIsArray && !core.types.isIdentifier(spread.argument, { name: "arguments" })) {
      return spread.argument;
    } else {
      const node = spread.argument;
      if (core.types.isIdentifier(node)) {
        const binding = scope.getBinding(node.name);
        if (binding?.constant && binding.path.isGenericType("Array")) {
          return node;
        }
      }
      if (core.types.isArrayExpression(node)) {
        return node;
      }
      if (core.types.isIdentifier(node, { name: "arguments" })) {
        return core.template.expression.ast`Array.prototype.slice.call(${node})`;
      }
      const args = [node];
      let helperName = "toConsumableArray";
      if (arrayLikeIsIterable) {
        args.unshift(scope.path.hub.addHelper(helperName));
        helperName = "maybeArrayLike";
      }
      return core.types.callExpression(scope.path.hub.addHelper(helperName), args);
    }
  };

  const hasHole = (spread) => spread.elements.includes(null);
  const hasSpread = (nodes) => nodes.some(node => core.types.isSpreadElement(node));

  const push = (_props, nodes) => {
    if (!_props.length) return _props;
    nodes.push(core.types.arrayExpression(_props));
    return [];
  };

  const build = (props, scope, file) => {
    const nodes = [];
    let _props = [];
    for (const prop of props) {
      if (core.types.isSpreadElement(prop)) {
        _props = push(_props, nodes);
        let spreadLiteral = getSpreadLiteral(prop, scope);
        if (core.types.isArrayExpression(spreadLiteral) && hasHole(spreadLiteral)) {
          spreadLiteral = core.types.callExpression(file.addHelper("arrayWithoutHoles"), [spreadLiteral]);
        }
        nodes.push(spreadLiteral);
      } else {
        _props.push(prop);
      }
    }
    push(_props, nodes);
    return nodes;
  };

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.elements)) return;

        const nodes = build(node.elements, scope, this.file);
        let first = nodes.shift() || core.types.arrayExpression([]);
        path.replaceWith(core.types.callExpression(core.types.memberExpression(first, core.types.identifier("concat")), nodes));
      },
      CallExpression(path) {
        const { node, scope } = path;
        const args = node.arguments;
        if (!hasSpread(args)) return;

        const calleePath = helperSkipTransparentExpressionWrappers.skipTransparentExprWrappers(path.get("callee"));
        if (calleePath.isSuper()) {
          throw path.buildCodeFrameError("Spread arguments in `super()` require class transformation. Add '@babel/plugin-transform-classes'.");
        }

        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];
       
        const nodes = args.length === 1 && core.types.isIdentifier(args[0].argument, { name: "arguments" })
          ? [args[0].argument]
          : build(args, scope, this.file);

        const first = nodes.shift();

        const callNode = nodes.length
          ? core.types.callExpression(core.types.memberExpression(first, core.types.identifier("concat")), nodes)
          : first;

        node.arguments.push(callNode);

        const callee = calleePath.node;
        if (core.types.isMemberExpression(callee)) {
          const temp = scope.maybeGenerateMemoised(callee.object);
          if (temp) {
            callee.object = core.types.assignmentExpression("=", temp, callee.object);
            contextLiteral = temp;
          } else {
            contextLiteral = core.types.cloneNode(callee.object);
          }
        }

        node.callee = core.types.memberExpression(node.callee, core.types.identifier("apply"));
        node.arguments.unshift(core.types.cloneNode(contextLiteral));
      },
      NewExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.arguments)) return;

        const nodes = build(node.arguments, scope, this.file);
        const args = nodes.length
          ? core.types.callExpression(core.types.memberExpression(nodes.shift(), core.types.identifier("concat")), nodes)
          : nodes.shift();

        path.replaceWith(core.types.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }
    }
  };
});
