"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const { types } = require("@babel/core");

exports.default = declare((api, options) => {
  api.assertVersion(7);

  const { loose = false, useBuiltIns = false, allowArrayLike = false } = options;

  if (typeof loose !== "boolean") {
    throw new Error(`.loose must be a boolean or undefined`);
  }

  const arrayOnlySpread = loose;

  function getExtendsHelper(file) {
    return useBuiltIns ? 
      types.memberExpression(types.identifier("Object"), types.identifier("assign")) : 
      file.addHelper("extends");
  }

  function variableDeclarationHasPattern(node) {
    return node.declarations.some(declar => types.isPattern(declar.id));
  }

  function hasRest(pattern) {
    return pattern.elements.some(elem => types.isRestElement(elem));
  }

  function hasObjectRest(pattern) {
    return pattern.properties.some(elem => types.isRestElement(elem));
  }

  const STOP_TRAVERSAL = {};

  const arrayUnpackVisitor = (node, ancestors, state) => {
    if (ancestors.length &&
        types.isIdentifier(node) &&
        types.isReferenced(node, ancestors[ancestors.length - 1]) &&
        state.bindings[node.name]) {
      state.deopt = true;
      throw STOP_TRAVERSAL;
    }
  };

  class DestructuringTransformer {
    constructor({ blockHoist, operator, nodes = [], scope, kind, arrayOnlySpread, allowArrayLike, addHelper }) {
      this.blockHoist = blockHoist;
      this.operator = operator;
      this.arrays = {};
      this.nodes = nodes;
      this.scope = scope;
      this.kind = kind;
      this.arrayOnlySpread = arrayOnlySpread;
      this.allowArrayLike = allowArrayLike;
      this.addHelper = addHelper;
    }

    buildVariableAssignment(id, init) {
      let op = this.operator;
      if (types.isMemberExpression(id)) op = "=";
      
      const node = op ? 
        types.expressionStatement(types.assignmentExpression(op, id, types.cloneNode(init) || this.scope.buildUndefinedNode())) :
        types.variableDeclaration(this.kind, [types.variableDeclarator(id, types.cloneNode(init))]);
        
      node._blockHoist = this.blockHoist;
      return node;
    }

    buildVariableDeclaration(id, init) {
      const declar = types.variableDeclaration("var", [types.variableDeclarator(types.cloneNode(id), types.cloneNode(init))]);
      declar._blockHoist = this.blockHoist;
      return declar;
    }

    push(id, _init) {
      const init = types.cloneNode(_init);

      if (types.isObjectPattern(id)) {
        this.pushObjectPattern(id, init);
      } else if (types.isArrayPattern(id)) {
        this.pushArrayPattern(id, init);
      } else if (types.isAssignmentPattern(id)) {
        this.pushAssignmentPattern(id, init);
      } else {
        this.nodes.push(this.buildVariableAssignment(id, init));
      }
    }

    toArray(node, count) {
      return this.arrayOnlySpread || (types.isIdentifier(node) && this.arrays[node.name]) ?
        node :
        this.scope.toArray(node, count, this.allowArrayLike);
    }

    pushAssignmentPattern({ left, right }, valueRef) {
      const tempId = this.scope.generateUidIdentifierBasedOnNode(valueRef);
      this.nodes.push(this.buildVariableDeclaration(tempId, valueRef));

      const tempConditional = types.conditionalExpression(
        types.binaryExpression("===", types.cloneNode(tempId), this.scope.buildUndefinedNode()),
        right,
        types.cloneNode(tempId)
      );

      if (types.isPattern(left)) {
        let patternId;
        let node;

        if (this.kind === "const" || this.kind === "let") {
          patternId = this.scope.generateUidIdentifier(tempId.name);
          node = this.buildVariableDeclaration(patternId, tempConditional);
        } else {
          patternId = tempId;
          node = types.expressionStatement(types.assignmentExpression("=", types.cloneNode(tempId), tempConditional));
        }

        this.nodes.push(node);
        this.push(left, patternId);
      } else {
        this.nodes.push(this.buildVariableAssignment(left, tempConditional));
      }
    }

    pushObjectRest(pattern, objRef, spreadProp, spreadPropIndex) {
      const keys = [];
      let allLiteral = true;

      for (let i = 0; i < pattern.properties.length; i++) {
        const prop = pattern.properties[i];
        if (i >= spreadPropIndex) break;
        if (types.isRestElement(prop)) continue;
        const key = prop.key;

        if (types.isIdentifier(key) && !prop.computed) {
          keys.push(types.stringLiteral(key.name));
        } else if (types.isTemplateLiteral(prop.key)) {
          keys.push(types.cloneNode(prop.key));
        } else if (types.isLiteral(key)) {
          keys.push(types.stringLiteral(String(key.value)));
        } else {
          keys.push(types.cloneNode(key));
          allLiteral = false;
        }
      }

      let value;

      if (keys.length === 0) {
        value = types.callExpression(getExtendsHelper(this), [types.objectExpression([]), types.cloneNode(objRef)]);
      } else {
        let keyExpression = types.arrayExpression(keys);

        if (!allLiteral) {
          keyExpression = types.callExpression(types.memberExpression(keyExpression, types.identifier("map")), [this.addHelper("toPropertyKey")]);
        }

        value = types.callExpression(this.addHelper(`objectWithoutProperties${loose ? "Loose" : ""}`), [types.cloneNode(objRef), keyExpression]);
      }

      this.nodes.push(this.buildVariableAssignment(spreadProp.argument, value));
    }

    pushObjectProperty(prop, propRef) {
      if (types.isLiteral(prop.key)) prop.computed = true;
      const pattern = prop.value;

      const objRef = types.memberExpression(types.cloneNode(propRef), prop.key, prop.computed);

      if (types.isPattern(pattern)) {
        this.push(pattern, objRef);
      } else {
        this.nodes.push(this.buildVariableAssignment(pattern, objRef));
      }
    }

    pushObjectPattern(pattern, objRef) {
      if (!pattern.properties.length) {
        this.nodes.push(types.expressionStatement(types.callExpression(this.addHelper("objectDestructuringEmpty"), [objRef])));
      }

      if (pattern.properties.length > 1 && !this.scope.isStatic(objRef)) {
        const temp = this.scope.generateUidIdentifierBasedOnNode(objRef);
        this.nodes.push(this.buildVariableDeclaration(temp, objRef));
        objRef = temp;
      }

      if (hasObjectRest(pattern)) {
        let copiedPattern;

        for (let i = 0; i < pattern.properties.length; i++) {
          const prop = pattern.properties[i];

          if (types.isRestElement(prop)) {
            break;
          }

          const key = prop.key;

          if (prop.computed && !this.scope.isPure(key)) {
            const name = this.scope.generateUidIdentifierBasedOnNode(key);
            this.nodes.push(this.buildVariableDeclaration(name, key));

            if (!copiedPattern) {
              copiedPattern = pattern = { ...pattern, properties: pattern.properties.slice() };
            }

            copiedPattern.properties[i] = { ...copiedPattern.properties[i], key: name };
          }
        }
      }

      for (const prop of pattern.properties) {
        if (types.isRestElement(prop)) {
          this.pushObjectRest(pattern, objRef, prop);
        } else {
          this.pushObjectProperty(prop, objRef);
        }
      }
    }

    canUnpackArrayPattern(pattern, arr) {
      if (!types.isArrayExpression(arr)) return false;
      if (pattern.elements.length > arr.elements.length) return false;

      if (pattern.elements.length < arr.elements.length && !hasRest(pattern)) {
        return false;
      }

      for (const elem of pattern.elements) {
        if (!elem || types.isMemberExpression(elem)) return false;
      }

      const state = {
        deopt: false,
        bindings: types.getBindingIdentifiers(pattern)
      };

      try {
        types.traverse(arr, arrayUnpackVisitor, state);
      } catch (e) {
        if (e !== STOP_TRAVERSAL) throw e;
      }

      return !state.deopt;
    }

    pushUnpackedArrayPattern(pattern, arr) {
      for (let i = 0; i < pattern.elements.length; i++) {
        let elem = pattern.elements[i];

        if (types.isRestElement(elem)) {
          this.push(elem.argument, types.arrayExpression(arr.elements.slice(i)));
        } else {
          this.push(elem, arr.elements[i]);
        }
      }
    }

    pushArrayPattern(pattern, arrayRef) {
      if (!pattern.elements) return;

      if (this.canUnpackArrayPattern(pattern, arrayRef)) {
        return this.pushUnpackedArrayPattern(pattern, arrayRef);
      }

      const count = !hasRest(pattern) && pattern.elements.length;
      const toArray = this.toArray(arrayRef, count);

      if (types.isIdentifier(toArray)) {
        arrayRef = toArray;
      } else {
        arrayRef = this.scope.generateUidIdentifierBasedOnNode(arrayRef);
        this.arrays[arrayRef.name] = true;
        this.nodes.push(this.buildVariableDeclaration(arrayRef, toArray));
      }

      for (let i = 0; i < pattern.elements.length; i++) {
        let elem = pattern.elements[i];
        if (!elem) continue;
        let elemRef;

        if (types.isRestElement(elem)) {
          elemRef = this.toArray(arrayRef);
          elemRef = types.callExpression(types.memberExpression(elemRef, types.identifier("slice")), [types.numericLiteral(i)]);
          elem = elem.argument;
        } else {
          elemRef = types.memberExpression(arrayRef, types.numericLiteral(i), true);
        }

        this.push(elem, elemRef);
      }
    }

    init(pattern, ref) {
      if (!types.isArrayExpression(ref) && !types.isMemberExpression(ref)) {
        const memo = this.scope.maybeGenerateMemoised(ref, true);

        if (memo) {
          this.nodes.push(this.buildVariableDeclaration(memo, types.cloneNode(ref)));
          ref = memo;
        }
      }

      this.push(pattern, ref);
      return this.nodes;
    }
  }

  return {
    name: "transform-destructuring",
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration()) return;
        if (!variableDeclarationHasPattern(declaration.node)) return;
        const specifiers = [];

        for (const name of Object.keys(path.getOuterBindingIdentifiers(path))) {
          specifiers.push(types.exportSpecifier(types.identifier(name), types.identifier(name)));
        }

        path.replaceWith(declaration.node);
        path.insertAfter(types.exportNamedDeclaration(null, specifiers));
      },

      ForXStatement(path) {
        const { node, scope } = path;
        const left = node.left;

        if (types.isPattern(left)) {
          const temp = scope.generateUidIdentifier("ref");
          node.left = types.variableDeclaration("var", [types.variableDeclarator(temp)]);
          path.ensureBlock();

          if (node.body.body.length === 0 && path.isCompletionRecord()) {
            node.body.body.unshift(types.expressionStatement(scope.buildUndefinedNode()));
          }

          node.body.body.unshift(types.expressionStatement(types.assignmentExpression("=", left, temp)));
          return;
        }

        if (!types.isVariableDeclaration(left)) return;
        const pattern = left.declarations[0].id;
        if (!types.isPattern(pattern)) return;
        const key = scope.generateUidIdentifier("ref");
        node.left = types.variableDeclaration(left.kind, [types.variableDeclarator(key, null)]);
        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: left.kind,
          scope,
          nodes,
          arrayOnlySpread,
          allowArrayLike,
          addHelper: name => this.addHelper(name)
        });
        destructuring.init(pattern, key);
        path.ensureBlock();
        const block = node.body;
        block.body = nodes.concat(block.body);
      },

      CatchClause({ node, scope }) {
        const pattern = node.param;
        if (!types.isPattern(pattern)) return;
        const ref = scope.generateUidIdentifier("ref");
        node.param = ref;
        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: "let",
          scope,
          nodes,
          arrayOnlySpread,
          allowArrayLike,
          addHelper: name => this.addHelper(name)
        });
        destructuring.init(pattern, ref);
        node.body.body = nodes.concat(node.body.body);
      },

      AssignmentExpression(path) {
        const { node, scope } = path;
        if (!types.isPattern(node.left)) return;
        const nodes = [];
        const destructuring = new DestructuringTransformer({
          operator: node.operator,
          scope,
          nodes,
          arrayOnlySpread,
          allowArrayLike,
          addHelper: name => this.addHelper(name)
        });
        let ref;

        if (path.isCompletionRecord() || !path.parentPath.isExpressionStatement()) {
          ref = scope.generateUidIdentifierBasedOnNode(node.right, "ref");
          nodes.push(types.variableDeclaration("var", [types.variableDeclarator(ref, node.right)]));

          if (types.isArrayExpression(node.right)) {
            destructuring.arrays[ref.name] = true;
          }
        }

        destructuring.init(node.left, ref || node.right);

        if (ref) {
          if (path.parentPath.isArrowFunctionExpression()) {
            path.replaceWith(types.blockStatement([]));
            nodes.push(types.returnStatement(types.cloneNode(ref)));
          } else {
            nodes.push(types.expressionStatement(types.cloneNode(ref)));
          }
        }

        path.replaceWithMultiple(nodes);
        path.scope.crawl();
      },

      VariableDeclaration(path) {
        const { node, scope, parent } = path;
        if (types.isForXStatement(parent)) return;
        if (!parent || !path.container) return;
        if (!variableDeclarationHasPattern(node)) return;

        const nodes = [];
        const nodesOut = [];
        let declar, tail;
        
        for (let i = 0; i < node.declarations.length; i++) {
          declar = node.declarations[i];
          const patternId = declar.init;
          const pattern = declar.id;
          const destructuring = new DestructuringTransformer({
            blockHoist: node._blockHoist,
            nodes,
            scope,
            kind: node.kind,
            arrayOnlySpread,
            allowArrayLike,
            addHelper: name => this.addHelper(name)
          });

          if (types.isPattern(pattern)) {
            destructuring.init(pattern, patternId);

            if (i !== node.declarations.length - 1) {
              types.inherits(nodes[nodes.length - 1], declar);
            }
          } else {
            nodes.push(types.inherits(destructuring.buildVariableAssignment(declar.id, types.cloneNode(declar.init)), declar));
          }
        }

        for (const node of nodes) {
          if (tail && types.isVariableDeclaration(node)) {
            tail.declarations.push(...node.declarations);
          } else {
            node.kind = node.kind;
            nodesOut.push(node);
            tail = types.isVariableDeclaration(node) ? node : null;
          }
        }

        for (const nodeOut of nodesOut) {
          if (!nodeOut.declarations) continue;

          for (const declaration of nodeOut.declarations) {
            const { name } = declaration.id;
            if (scope.bindings[name]) {
              scope.bindings[name].kind = nodeOut.kind;
            }
          }
        }

        if (nodesOut.length === 1) {
          path.replaceWith(nodesOut[0]);
        } else {
          path.replaceWithMultiple(nodesOut);
        }
      }
    }
  };
});
