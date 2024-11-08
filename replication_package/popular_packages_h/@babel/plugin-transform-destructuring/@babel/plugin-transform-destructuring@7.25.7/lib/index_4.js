'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { declare } = require('@babel/helper-plugin-utils');
const { types, template } = require('@babel/core');

// Function to check if a node is a pure void expression
function isPureVoid(node) {
  return types.isUnaryExpression(node) && node.operator === "void" && types.isPureish(node.argument);
}

// Helper function to unshift newStatements into a block statement body
function unshiftForXStatementBody(statementPath, newStatements) {
  statementPath.ensureBlock();
  const { scope, node } = statementPath;
  const bodyScopeBindings = statementPath.get("body").scope.bindings;
  const hasShadowedBlockScopedBindings = Object.keys(bodyScopeBindings).some(name => scope.hasBinding(name));
  
  if (hasShadowedBlockScopedBindings) {
    node.body = types.blockStatement([...newStatements, node.body]);
  } else {
    node.body.body.unshift(...newStatements);
  }
}

// Functions to check for rest elements in patterns
function hasArrayRest(pattern) {
  return pattern.elements.some(elem => types.isRestElement(elem));
}

function hasObjectRest(pattern) {
  return pattern.properties.some(prop => types.isRestElement(prop));
}

// Constant for stopping traversal
const STOP_TRAVERSAL = {};

// Visitor for array unpacking
const arrayUnpackVisitor = (node, ancestors, state) => {
  if (!ancestors.length) return;
  if (types.isIdentifier(node) && types.isReferenced(node, ancestors[ancestors.length - 1].node) && state.bindings[node.name]) {
    state.deopt = true;
    throw STOP_TRAVERSAL;
  }
};

// Main class to transform destructuring
class DestructuringTransformer {
  constructor(opts) {
    this.blockHoist = opts.blockHoist;
    this.operator = opts.operator;
    this.nodes = opts.nodes || [];
    this.scope = opts.scope;
    this.kind = opts.kind;
    this.arrayRefSet = new Set();
    this.iterableIsArray = opts.iterableIsArray;
    this.arrayLikeIsIterable = opts.arrayLikeIsIterable;
    this.objectRestNoSymbols = opts.objectRestNoSymbols;
    this.useBuiltIns = opts.useBuiltIns;
    this.addHelper = opts.addHelper;
  }

  getExtendsHelper() {
    return this.useBuiltIns ? types.memberExpression(types.identifier("Object"), types.identifier("assign")) : this.addHelper("extends");
  }
  
  buildVariableAssignment(id, init) {
    let op = this.operator;
    if (types.isMemberExpression(id) || types.isOptionalMemberExpression(id)) op = "=";
    
    let node;
    if (op) {
      node = types.expressionStatement(types.assignmentExpression(op, id, types.cloneNode(init) || this.scope.buildUndefinedNode()));
    } else {
      let nodeInit = (this.kind === "const" || this.kind === "using") && init === null ? this.scope.buildUndefinedNode() : types.cloneNode(init);
      node = types.variableDeclaration(this.kind, [types.variableDeclarator(id, nodeInit)]);
    }
    node._blockHoist = this.blockHoist;
    return node;
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
    if (this.iterableIsArray || (types.isIdentifier(node) && this.arrayRefSet.has(node.name))) {
      return node;
    } else {
      const { scope, arrayLikeIsIterable } = this;
      if (types.isIdentifier(node)) {
        const binding = scope.getBinding(node.name);
        if (binding && binding.constant && binding.path.isGenericType("Array")) {
          return node;
        }
      }
      if (types.isArrayExpression(node)) {
        return node;
      }
      if (types.isIdentifier(node, { name: "arguments" })) {
        return template.expression.ast`Array.prototype.slice.call(${node})`;
      }
      let helperName;
      const args = [node];
      if (typeof count === "number") {
        args.push(types.numericLiteral(count));
        helperName = "slicedToArray";
      } else {
        helperName = "toArray";
      }
      if (arrayLikeIsIterable) {
        args.unshift(scope.path.hub.addHelper(helperName));
        helperName = "maybeArrayLike";
      }
      return types.callExpression(scope.path.hub.addHelper(helperName), args);
    }
  }
  
  pushObjectPattern(pattern, objRef) {
    if (!pattern.properties.length) {
      this.nodes.push(types.expressionStatement(types.callExpression(this.addHelper("objectDestructuringEmpty"), isPureVoid(objRef) ? [] : [objRef])));
      return;
    }
    if (pattern.properties.length > 1 && !this.scope.isStatic(objRef)) {
      const temp = this.scope.generateUidIdentifierBasedOnNode(objRef);
      this.nodes.push(this.buildVariableDeclaration(temp, objRef));
      objRef = temp;
    }
    for (let i = 0; i < pattern.properties.length; i++) {
      const prop = pattern.properties[i];
      if (types.isRestElement(prop)) {
        this.pushObjectRest(pattern, objRef, prop, i);
      } else {
        this.pushObjectProperty(prop, objRef);
      }
    }
  }

  buildVariableDeclaration(id, init) {
    const declar = types.variableDeclaration("var", [types.variableDeclarator(types.cloneNode(id), types.cloneNode(init))]);
    declar._blockHoist = this.blockHoist;
    return declar;
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

// Convert a variable declaration that has a pattern
function convertVariableDeclaration(path, addHelper, arrayLikeIsIterable, iterableIsArray, objectRestNoSymbols, useBuiltIns) {
  const { node, scope } = path;
  const nodeKind = node.kind;
  const nodes = [];
  
  for (let i = 0; i < node.declarations.length; i++) {
    const declar = node.declarations[i];
    const patternId = declar.init;
    const pattern = declar.id;
    const destructuring = new DestructuringTransformer({
      blockHoist: node._blockHoist,
      nodes,
      scope,
      kind: node.kind,
      iterableIsArray,
      arrayLikeIsIterable,
      useBuiltIns,
      objectRestNoSymbols,
      addHelper,
    });
    if (types.isPattern(pattern)) {
      destructuring.init(pattern, patternId);
    } else {
      nodes.push(types.inherits(destructuring.buildVariableAssignment(pattern, patternId), declar));
    }
  }

  let tail = null;
  let nodesOut = [];
  for (const node of nodes) {
    if (types.isVariableDeclaration(node)) {
      if (tail !== null) {
        tail.declarations.push(...node.declarations);
        continue;
      } else {
        node.kind = nodeKind;
        tail = node;
      }
    } else {
      tail = null;
    }
    nodesOut.push(node);
  }

  if (nodesOut.length === 1) {
    path.replaceWith(nodesOut[0]);
  } else {
    path.replaceWithMultiple(nodesOut);
  }
  scope.crawl();
}

// Plugin entry
const index = declare((api, options) => {
  api.assertVersion(7);
  const { useBuiltIns = false } = options;
  const iterableIsArray = api.assumption("iterableIsArray") ?? options.loose ?? false;
  const arrayLikeIsIterable = options.allowArrayLike ?? api.assumption("arrayLikeIsIterable") ?? false;
  const objectRestNoSymbols = api.assumption("objectRestNoSymbols") ?? options.loose ?? false;

  return {
    name: "transform-destructuring",
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration()) return;
        if (!variableDeclarationHasPattern(declaration.node)) return;

        const specifiers = [];
        for (const name of Object.keys(path.getOuterBindingIdentifiers())) {
          specifiers.push(types.exportSpecifier(types.identifier(name), types.identifier(name)));
        }

        path.replaceWith(declaration.node);
        path.insertAfter(types.exportNamedDeclaration(null, specifiers));
        path.scope.crawl();
      },
      VariableDeclaration(path, state) {
        const { node, parent } = path;
        if (!variableDeclarationHasPattern(node)) return;
        convertVariableDeclaration(path, name => state.addHelper(name), arrayLikeIsIterable, iterableIsArray, objectRestNoSymbols, useBuiltIns);
      }
    }
  };
});

exports.buildObjectExcludingKeys = function buildObjectExcludingKeys(excludedKeys, objRef, scope, addHelper, objectRestNoSymbols, useBuiltIns) {
  const keys = [];
  let allLiteral = true;

  for (const prop of excludedKeys) {
    const key = prop.key;
    if (types.isIdentifier(key) && !prop.computed) {
      keys.push(types.stringLiteral(key.name));
    } else if (types.isTemplateLiteral(key)) {
      keys.push(types.cloneNode(key));
    } else if (types.isLiteral(key)) {
      keys.push(types.stringLiteral(String(key.value)));
    } else {
      keys.push(types.cloneNode(key));
      allLiteral = false;
    }
  }

  let keyExpression = types.arrayExpression(keys);
  if (!allLiteral) {
    keyExpression = types.callExpression(types.memberExpression(keyExpression, types.identifier("map")), [addHelper("toPropertyKey")]);
  }

  return types.callExpression(addHelper(`objectWithoutProperties${objectRestNoSymbols ? "Loose" : ""}`), [types.cloneNode(objRef), keyExpression]);
};

exports.default = index;
exports.unshiftForXStatementBody = unshiftForXStatementBody;
