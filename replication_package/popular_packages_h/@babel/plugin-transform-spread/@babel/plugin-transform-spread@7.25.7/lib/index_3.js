"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
    
    if (types.isIdentifier(node)) {
      const binding = scope.getBinding(node.name);
      if (binding?.constant && binding.path.isGenericType("Array")) {
        return node;
      }
    }
    
    if (types.isArrayExpression(node)) {
      return node;
    }
    
    if (types.isIdentifier(node, { name: "arguments" })) {
      return template.expression.ast`Array.prototype.slice.call(${node})`;
    }
    
    const helperName = arrayLikeIsIterable ? "maybeArrayLike" : "toConsumableArray";
    return types.callExpression(scope.path.hub.addHelper(helperName), [node]);
  }

  function hasHole(spread) {
    return spread.elements.includes(null);
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

  function build(props, scope, file) {
    const nodes = [];
    let currentProps = [];
    
    for (const prop of props) {
      if (types.isSpreadElement(prop)) {
        currentProps = push(currentProps, nodes);
        let spreadLiteral = getSpreadLiteral(prop, scope);
        
        if (types.isArrayExpression(spreadLiteral) && hasHole(spreadLiteral)) {
          spreadLiteral = types.callExpression(file.addHelper("arrayWithoutHoles"), [spreadLiteral]);
        }
        
        nodes.push(spreadLiteral);
      } else {
        currentProps.push(prop);
      }
    }
    
    push(currentProps, nodes);
    return nodes;
  }

  return {
    name: "transform-spread",
    visitor: {
      ArrayExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.elements)) return;

        const elements = build(node.elements, scope, this.file);
        let firstElement = elements[0];
        
        if (elements.length === 1 && firstElement !== node.elements[0].argument) {
          path.replaceWith(firstElement);
          return;
        }
        
        if (!types.isArrayExpression(firstElement)) {
          firstElement = types.arrayExpression([]);
        } else {
          elements.shift();
        }
        
        path.replaceWith(types.callExpression(types.memberExpression(firstElement, types.identifier("concat")), elements));
      },
      CallExpression(path) {
        const { node, scope } = path;
        if (!hasSpread(node.arguments)) return;
        
        const calleePath = skipTransparentExprWrappers(path.get("callee"));

        if (calleePath.isSuper()) {
          throw path.buildCodeFrameError("It's not possible to compile spread arguments in `super()` without compiling classes.\nPlease add '@babel/plugin-transform-classes' to your Babel configuration.");
        }
        
        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];

        const args = node.arguments;
        const builtArgs = args.length === 1 && types.isIdentifier(args[0].argument, { name: "arguments" }) ? [args[0].argument] : build(args, scope, this.file);

        const firstArg = builtArgs.shift();
        
        if (builtArgs.length) {
          node.arguments.push(types.callExpression(types.memberExpression(firstArg, types.identifier("concat")), builtArgs));
        } else {
          node.arguments.push(firstArg);
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
        const first = nodes.shift();
        
        const args = nodes.length ? types.callExpression(types.memberExpression(first, types.identifier("concat")), nodes) : first;
        
        path.replaceWith(types.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }
    }
  };
});

//# sourceMappingURL=index.js.map
