"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const { skipTransparentExprWrappers } = require("@babel/helper-skip-transparent-expression-wrappers");
const { types, template } = require("@babel/core");

exports.default = declare((api, options) => {

  api.assertVersion(7);

  const iterableIsArray = api.assumption("iterableIsArray") ?? options.loose;
  const arrayLikeIsIterable = options.allowArrayLike ?? api.assumption("arrayLikeIsIterable");

  function getSpreadLiteral(spread, scope) {
    const node = spread.argument;
    if (iterableIsArray && !types.isIdentifier(node, { name: "arguments" })) {
      return node;
    }
    if (types.isIdentifier(node) && scope.getBinding(node.name)?.constant && scope.getBinding(node.name).path.isGenericType("Array")) {
      return node;
    }
    if (types.isArrayExpression(node)) {
      return node;
    }
    if (types.isIdentifier(node, { name: "arguments" })) {
      return template.expression.ast`Array.prototype.slice.call(${node})`;
    }
    const args = [node];
    let helperName = "toConsumableArray";
    if (arrayLikeIsIterable) {
      args.unshift(scope.path.hub.addHelper(helperName));
      helperName = "maybeArrayLike";
    }
    return types.callExpression(scope.path.hub.addHelper(helperName), args);
  }

  function hasHole(spread) {
    return spread.elements.includes(null);
  }

  function hasSpread(nodes) {
    return nodes.some(node => types.isSpreadElement(node));
  }

  function push(_props, nodes) {
    if (_props.length) {
      nodes.push(types.arrayExpression(_props));
      return [];
    }
    return _props;
  }

  function build(props, scope, file) {
    const nodes = [];
    let _props = [];
    for (const prop of props) {
      if (types.isSpreadElement(prop)) {
        _props = push(_props, nodes);
        let spreadLiteral = getSpreadLiteral(prop, scope);
        if (types.isArrayExpression(spreadLiteral) && hasHole(spreadLiteral)) {
          spreadLiteral = types.callExpression(file.addHelper("arrayWithoutHoles"), [spreadLiteral]);
        }
        nodes.push(spreadLiteral);
      } else {
        _props.push(prop);
      }
    }
    push(_props, nodes);
    return nodes;
  }

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { node, scope } = path;
        const elements = node.elements;
        if (!hasSpread(elements)) return;

        const nodes = build(elements, scope, this.file);
        let first = nodes[0];
        if (nodes.length === 1 && first !== elements[0].argument) {
          path.replaceWith(first);
          return;
        }
        if (!types.isArrayExpression(first)) {
          first = types.arrayExpression([]);
        } else {
          nodes.shift();
        }
        path.replaceWith(types.callExpression(types.memberExpression(first, types.identifier("concat")), nodes));
      },
      CallExpression(path) {
        const { node, scope } = path;
        const args = node.arguments;
        if (!hasSpread(args)) return;

        const calleePath = skipTransparentExprWrappers(path.get("callee"));
        if (calleePath.isSuper()) {
          throw path.buildCodeFrameError(
            "It's not possible to compile spread arguments in `super()` without compiling classes.\n" +
            "Please add '@babel/plugin-transform-classes' to your Babel configuration."
          );
        }

        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];
        let nodes;

        if (args.length === 1 && types.isIdentifier(args[0].argument, { name: "arguments" })) {
          nodes = [args[0].argument];
        } else {
          nodes = build(args, scope, this.file);
        }

        const first = nodes.shift();
        if (nodes.length) {
          node.arguments.push(types.callExpression(types.memberExpression(first, types.identifier("concat")), nodes));
        } else {
          node.arguments.push(first);
        }

        const callee = calleePath.node;
        if (types.isMemberExpression(callee)) {
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

        const nodes = build(node.arguments, scope, this.file);
        let first = nodes.shift();
        const args = nodes.length
          ? types.callExpression(types.memberExpression(first, types.identifier("concat")), nodes)
          : first;

        path.replaceWith(types.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }
    }
  };
});
