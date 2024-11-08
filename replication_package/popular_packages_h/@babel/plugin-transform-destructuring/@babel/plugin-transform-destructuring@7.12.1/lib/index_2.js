"use strict";

import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/core";

const destructuringPlugin = declare((api, options) => {
  api.assertVersion(7);
  const { loose = false, useBuiltIns = false, allowArrayLike = false } = options;

  if (typeof loose !== "boolean") {
    throw new Error(`.loose must be a boolean or undefined`);
  }

  const arrayOnlySpread = loose;

  function getExtendsHelper(file) {
    return useBuiltIns ? t.memberExpression(t.identifier("Object"), t.identifier("assign")) : file.addHelper("extends");
  }

  function variableDeclarationHasPattern(node) {
    return node.declarations.some(declar => t.isPattern(declar.id));
  }

  class DestructuringTransformer {
    constructor(opts) {
      Object.assign(this, opts);
      this.arrays = {};
    }

    buildVariableAssignment(id, init) {
      let op = this.operator;
      if (t.isMemberExpression(id)) op = "=";
      const node = op
        ? t.expressionStatement(t.assignmentExpression(op, id, t.cloneNode(init) || this.scope.buildUndefinedNode()))
        : t.variableDeclaration(this.kind, [t.variableDeclarator(id, t.cloneNode(init))]);
      node._blockHoist = this.blockHoist;
      return node;
    }

    buildVariableDeclaration(id, init) {
      const declar = t.variableDeclaration("var", [t.variableDeclarator(t.cloneNode(id), t.cloneNode(init))]);
      declar._blockHoist = this.blockHoist;
      return declar;
    }

    push(id, _init) {
      const init = t.cloneNode(_init);
      if (t.isObjectPattern(id)) {
        this.pushObjectPattern(id, init);
      } else if (t.isArrayPattern(id)) {
        this.pushArrayPattern(id, init);
      } else if (t.isAssignmentPattern(id)) {
        this.pushAssignmentPattern(id, init);
      } else {
        this.nodes.push(this.buildVariableAssignment(id, init));
      }
    }

    pushAssignmentPattern({ left, right }, valueRef) {
      const tempId = this.scope.generateUidIdentifierBasedOnNode(valueRef);
      this.nodes.push(this.buildVariableDeclaration(tempId, valueRef));
      const tempConditional = t.conditionalExpression(t.binaryExpression("===", t.cloneNode(tempId), this.scope.buildUndefinedNode()), right, t.cloneNode(tempId));
      if (t.isPattern(left)) {
        const patternId = this.kind === "const" || this.kind === "let" ? this.scope.generateUidIdentifier(tempId.name) : tempId;
        const node = this.buildVariableDeclaration(patternId, tempConditional);
        this.nodes.push(node);
        this.push(left, patternId);
      } else {
        this.nodes.push(this.buildVariableAssignment(left, tempConditional));
      }
    }

    pushObjectPattern(pattern, objRef) {
      if (!pattern.properties.length) {
        this.nodes.push(t.expressionStatement(t.callExpression(this.addHelper("objectDestructuringEmpty"), [objRef])));
        return;
      }

      // Create temp variable if ref has side-effects
      if (pattern.properties.length > 1 && !this.scope.isStatic(objRef)) {
        const temp = this.scope.generateUidIdentifierBasedOnNode(objRef);
        this.nodes.push(this.buildVariableDeclaration(temp, objRef));
        objRef = temp;
      }

      for (let i = 0; i < pattern.properties.length; i++) {
        const prop = pattern.properties[i];
        if (t.isRestElement(prop)) {
          const spreadProps = pattern.properties.slice(i + 1).map(p => p.key);
          const value = this.addHelper(spreadProps.length ? "objectWithoutProperties" : "objectWithoutPropertiesLoose");
          const node = t.callExpression(value, [t.cloneNode(objRef), t.arrayExpression(spreadProps)]);
          this.nodes.push(this.buildVariableAssignment(prop.argument, node));
          break;
        } else {
          const objProp = t.memberExpression(t.cloneNode(objRef), t.toNode(prop.key));
          this.push(prop.value, objProp);
        }
      }
    }

    pushArrayPattern(pattern, arrayRef) {
      if (!pattern.elements) return;
      const count = pattern.elements.length;
      const toArray = this.toArray(arrayRef, count);

      arrayRef = t.isIdentifier(toArray) ? toArray : this.scope.generateUidIdentifierBasedOnNode(arrayRef);
      if (t.isIdentifier(toArray)) {
        arrayRef = toArray;
      } else {
        this.nodes.push(this.buildVariableDeclaration(arrayRef, toArray));
      }

      for (let i = 0; i < pattern.elements.length; i++) {
        let elem = pattern.elements[i];
        if (!elem) continue;
        let elemRef = t.isRestElement(elem)
          ? t.callExpression(t.memberExpression(arrayRef, t.identifier("slice")), [t.numericLiteral(i)])
          : t.memberExpression(arrayRef, t.numericLiteral(i), true);
        if (t.isRestElement(elem)) {
          elem = elem.argument;
        }
        this.push(elem, elemRef);
      }
    }

    toArray(node, count) {
      return (arrayOnlySpread || (t.isIdentifier(node) && this.arrays[node.name])) ? node : this.scope.toArray(node, count, this.allowArrayLike);
    }

    init(pattern, ref) {
      if (!_core.types.isArrayExpression(ref) && !_core.types.isMemberExpression(ref)) {
        const memo = this.scope.maybeGenerateMemoised(ref, true);
        if (memo) {
          this.nodes.push(this.buildVariableDeclaration(memo, t.cloneNode(ref)));
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
          specifiers.push(t.exportSpecifier(t.identifier(name), t.identifier(name)));
        }
        path.replaceWith(declaration.node);
        path.insertAfter(t.exportNamedDeclaration(null, specifiers));
      },

      ForXStatement(path) {
        const { node, scope } = path;
        const left = node.left;
        if (t.isPattern(left)) {
          const temp = scope.generateUidIdentifier("ref");
          node.left = t.variableDeclaration("var", [t.variableDeclarator(temp)]);
          path.ensureBlock();
          if (node.body.body.length === 0 && path.isCompletionRecord()) node.body.body.unshift(t.expressionStatement(scope.buildUndefinedNode()));
          node.body.body.unshift(t.expressionStatement(t.assignmentExpression("=", left, temp)));
          return;
        }
        if (!t.isVariableDeclaration(left)) return;
        const pattern = left.declarations[0].id;
        if (!t.isPattern(pattern)) return;
        const key = scope.generateUidIdentifier("ref");
        node.left = t.variableDeclaration(left.kind, [t.variableDeclarator(key, null)]);
        const nodes = [];
        new DestructuringTransformer({ kind: left.kind, scope, nodes, arrayOnlySpread, allowArrayLike, addHelper: name => this.addHelper(name) }).init(pattern, key);
        path.ensureBlock();
        const block = node.body;
        block.body = nodes.concat(block.body);
      },

      CatchClause({ node, scope }) {
        const pattern = node.param;
        if (!t.isPattern(pattern)) return;
        const ref = scope.generateUidIdentifier("ref");
        node.param = ref;
        const nodes = [];
        new DestructuringTransformer({ kind: "let", scope, nodes, arrayOnlySpread, allowArrayLike, addHelper: name => this.addHelper(name) }).init(pattern, ref);
        node.body.body = nodes.concat(node.body.body);
      },

      AssignmentExpression(path) {
        const { node, scope } = path;
        if (!t.isPattern(node.left)) return;
        const nodes = [];
        const destructuring = new DestructuringTransformer({ operator: node.operator, scope, nodes, arrayOnlySpread, allowArrayLike, addHelper: name => this.addHelper(name) });
        let ref;
        if (path.isCompletionRecord() || !path.parentPath.isExpressionStatement()) {
          ref = scope.generateUidIdentifierBasedOnNode(node.right, "ref");
          nodes.push(t.variableDeclaration("var", [t.variableDeclarator(ref, node.right)]));
          if (t.isArrayExpression(node.right)) destructuring.arrays[ref.name] = true;
        }
        destructuring.init(node.left, ref || node.right);
        if (ref) {
          if (path.parentPath.isArrowFunctionExpression()) {
            path.replaceWith(t.blockStatement([]));
            nodes.push(t.returnStatement(t.cloneNode(ref)));
          } else {
            nodes.push(t.expressionStatement(t.cloneNode(ref)));
          }
        }
        path.replaceWithMultiple(nodes);
        path.scope.crawl();
      },

      VariableDeclaration(path) {
        const { node, scope, parent } = path;
        if (t.isForXStatement(parent)) return;
        if (!parent || !path.container) return;
        if (!variableDeclarationHasPattern(node)) return;
        const nodeKind = node.kind;
        const nodes = [];
        for (const declar of node.declarations) {
          const patternId = declar.init;
          const pattern = declar.id;
          const destructuring = new DestructuringTransformer({ blockHoist: node._blockHoist, nodes, scope, kind: node.kind, arrayOnlySpread, allowArrayLike, addHelper: name => this.addHelper(name) });
          if (t.isPattern(pattern)) destructuring.init(pattern, patternId);
          else nodes.push(t.inherits(destructuring.buildVariableAssignment(declar.id, t.cloneNode(declar.init)), declar));
        }

        const nodesOut = [];
        let tail = null;
        for (const node of nodes) {
          if (tail !== null && t.isVariableDeclaration(node)) {
            tail.declarations.push(...node.declarations);
          } else {
            node.kind = nodeKind;
            nodesOut.push(node);
            tail = t.isVariableDeclaration(node) ? node : null;
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

export default destructuringPlugin;
