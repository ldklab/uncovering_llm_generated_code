'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const helperPluginUtils = require('@babel/helper-plugin-utils');
const { types, template } = require('@babel/core');

function isPureVoid(node) {
  return types.isUnaryExpression(node) && node.operator === "void" && types.isPureish(node.argument);
}

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

function hasArrayRest(pattern) {
  return pattern.elements.some(elem => types.isRestElement(elem));
}

function hasObjectRest(pattern) {
  return pattern.properties.some(prop => types.isRestElement(prop));
}

const STOP_TRAVERSAL = {};

const arrayUnpackVisitor = (node, ancestors, state) => {
  if (!ancestors.length) return;

  if (types.isIdentifier(node) && types.isReferenced(node, ancestors[ancestors.length - 1].node) && state.bindings[node.name]) {
    state.deopt = true;
    throw STOP_TRAVERSAL;
  }
};

class DestructuringTransformer {
  constructor(opts) {
    this.blockHoist = opts.blockHoist;
    this.operator = opts.operator;
    this.arrayRefSet = new Set();
    this.nodes = opts.nodes || [];
    this.scope = opts.scope;
    this.kind = opts.kind;
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
    if (this.iterableIsArray || (types.isIdentifier(node) && this.arrayRefSet.has(node.name))) {
      return node;
    } else {
      const { scope, arrayLikeIsIterable } = this;
      if (types.isIdentifier(node)) {
        const binding = scope.getBinding(node.name);
        if (binding != null && binding.constant && binding.path.isGenericType("Array")) {
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

  pushAssignmentPattern({ left, right }, valueRef) {
    if (isPureVoid(valueRef)) {
      this.push(left, right);
      return;
    }

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
      if (this.kind === "const" || this.kind === "let" || this.kind === "using") {
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
    const value = buildObjectExcludingKeys(
      pattern.properties.slice(0, spreadPropIndex),
      objRef,
      this.scope,
      name => this.addHelper(name),
      this.objectRestNoSymbols,
      this.useBuiltIns
    );
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
      this.nodes.push(types.expressionStatement(types.callExpression(this.addHelper("objectDestructuringEmpty"), isPureVoid(objRef) ? [] : [objRef])));
      return;
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

        if (types.isRestElement(prop)) break;

        const key = prop.key;
        if (prop.computed && !this.scope.isPure(key)) {
          const name = this.scope.generateUidIdentifierBasedOnNode(key);
          this.nodes.push(this.buildVariableDeclaration(name, key));

          if (!copiedPattern) {
            copiedPattern = pattern = Object.assign({}, pattern, {
              properties: pattern.properties.slice()
            });
          }
          copiedPattern.properties[i] = Object.assign({}, prop, { key: name });
        }
      }
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

  canUnpackArrayPattern(pattern, arr) {
    if (!types.isArrayExpression(arr)) return false;
    if (pattern.elements.length > arr.elements.length) return false;
    if (pattern.elements.length < arr.elements.length && !hasArrayRest(pattern)) {
      return false;
    }
    for (const elem of pattern.elements) {
      if (!elem) return false;
      if (types.isMemberExpression(elem)) return false;
    }
    for (const elem of arr.elements) {
      if (types.isSpreadElement(elem)) return false;
      if (types.isCallExpression(elem)) return false;
      if (types.isMemberExpression(elem)) return false;
    }

    const bindings = types.getBindingIdentifiers(pattern);
    const state = { deopt: false, bindings };

    try {
      types.traverse(arr, arrayUnpackVisitor, state);
    } catch (e) {
      if (e !== STOP_TRAVERSAL) throw e;
    }

    return !state.deopt;
  }

  pushUnpackedArrayPattern(pattern, arr) {
    const holeToUndefined = el => el != null ? el : this.scope.buildUndefinedNode();

    for (let i = 0; i < pattern.elements.length; i++) {
      const elem = pattern.elements[i];

      if (types.isRestElement(elem)) {
        this.push(elem.argument, types.arrayExpression(arr.elements.slice(i).map(holeToUndefined)));
      } else {
        this.push(elem, holeToUndefined(arr.elements[i]));
      }
    }
  }

  pushArrayPattern(pattern, arrayRef) {
    if (arrayRef === null) {
      this.nodes.push(types.expressionStatement(types.callExpression(this.addHelper("objectDestructuringEmpty"), [])));
      return;
    }

    if (!pattern.elements) return;

    if (this.canUnpackArrayPattern(pattern, arrayRef)) {
      this.pushUnpackedArrayPattern(pattern, arrayRef);
      return;
    }

    const count = !hasArrayRest(pattern) && pattern.elements.length;
    const toArray = this.toArray(arrayRef, count);

    if (types.isIdentifier(toArray)) {
      arrayRef = toArray;
    } else {
      arrayRef = this.scope.generateUidIdentifierBasedOnNode(arrayRef);
      this.arrayRefSet.add(arrayRef.name);
      this.nodes.push(this.buildVariableDeclaration(arrayRef, toArray));
    }

    for (let i = 0; i < pattern.elements.length; i++) {
      const elem = pattern.elements[i];
      if (!elem) continue;

      let elemRef;
      if (types.isRestElement(elem)) {
        elemRef = this.toArray(arrayRef);
        elemRef = types.callExpression(types.memberExpression(elemRef, types.identifier("slice")), [types.numericLiteral(i)]);
        this.push(elem.argument, elemRef);
      } else {
        elemRef = types.memberExpression(arrayRef, types.numericLiteral(i), true);
        this.push(elem, elemRef);
      }
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

function buildObjectExcludingKeys(excludedKeys, objRef, scope, addHelper, objectRestNoSymbols, useBuiltIns) {
  const keys = [];
  let allLiteral = true;
  let hasTemplateLiteral = false;

  for (let i = 0; i < excludedKeys.length; i++) {
    const prop = excludedKeys[i];
    const key = prop.key;

    if (types.isIdentifier(key) && !prop.computed) {
      keys.push(types.stringLiteral(key.name));
    } else if (types.isTemplateLiteral(key)) {
      keys.push(types.cloneNode(key));
      hasTemplateLiteral = true;
    } else if (types.isLiteral(key)) {
      keys.push(types.stringLiteral(String(key.value)));
    } else {
      keys.push(types.cloneNode(key));
      allLiteral = false;
    }
  }

  let value;
  if (keys.length === 0) {
    const extendsHelper = useBuiltIns ? types.memberExpression(types.identifier("Object"), types.identifier("assign")) : addHelper("extends");
    value = types.callExpression(extendsHelper, [
      types.objectExpression([]),
      types.sequenceExpression([types.callExpression(addHelper("objectDestructuringEmpty"), [types.cloneNode(objRef)]), types.cloneNode(objRef)])
    ]);
  } else {
    let keyExpression = types.arrayExpression(keys);
    if (!allLiteral) {
      keyExpression = types.callExpression(types.memberExpression(keyExpression, types.identifier("map")), [addHelper("toPropertyKey")]);
    } else if (!hasTemplateLiteral && !types.isProgram(scope.block)) {
      const programScope = scope.getProgramParent();
      const id = programScope.generateUidIdentifier("excluded");
      programScope.push({ id, init: keyExpression, kind: "const" });
      keyExpression = types.cloneNode(id);
    }

    value = types.callExpression(addHelper(`objectWithoutProperties${objectRestNoSymbols ? "Loose" : ""}`), [types.cloneNode(objRef), keyExpression]);
  }
  return value;
}

function convertVariableDeclaration(path, addHelper, arrayLikeIsIterable, iterableIsArray, objectRestNoSymbols, useBuiltIns) {
  const { node, scope } = path;
  const nodeKind = node.kind;
  const nodeLoc = node.loc;
  const nodes = [];
  
  for (let i = 0; i < node.declarations.length; i++) {
    const declar = node.declarations[i];
    const patternId = declar.init;
    const pattern = declar.id;

    const destructuring = new DestructuringTransformer({
      blockHoist: node._blockHoist,
      nodes: nodes,
      scope: scope,
      kind: node.kind,
      iterableIsArray,
      arrayLikeIsIterable,
      useBuiltIns,
      objectRestNoSymbols,
      addHelper
    });

    if (types.isPattern(pattern)) {
      destructuring.init(pattern, patternId);
      if (+i !== node.declarations.length - 1) {
        types.inherits(nodes[nodes.length - 1], declar);
      }
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

    if (!node.loc) {
      node.loc = nodeLoc;
    }
    nodesOut.push(node);
  }

  if (nodesOut.length === 2 && types.isVariableDeclaration(nodesOut[0]) && types.isExpressionStatement(nodesOut[1]) && types.isCallExpression(nodesOut[1].expression) && nodesOut[0].declarations.length === 1) {
    const expr = nodesOut[1].expression;
    expr.arguments = [nodesOut[0].declarations[0].init];
    nodesOut = [expr];
  } else {
    if (types.isForStatement(path.parent, { init: node }) && !nodesOut.some(v => types.isVariableDeclaration(v))) {
      for (let i = 0; i < nodesOut.length; i++) {
        const node = nodesOut[i];
        if (types.isExpressionStatement(node)) {
          nodesOut[i] = node.expression;
        }
      }
    }
  }

  if (nodesOut.length === 1) {
    path.replaceWith(nodesOut[0]);
  } else {
    path.replaceWithMultiple(nodesOut);
  }
  
  scope.crawl();
}

function convertAssignmentExpression(path, addHelper, arrayLikeIsIterable, iterableIsArray, objectRestNoSymbols, useBuiltIns) {
  const { node, scope, parentPath } = path;
  const nodes = [];

  const destructuring = new DestructuringTransformer({
    operator: node.operator,
    scope: scope,
    nodes: nodes,
    arrayLikeIsIterable,
    iterableIsArray,
    objectRestNoSymbols,
    useBuiltIns,
    addHelper
  });

  let ref;
  if (!parentPath.isExpressionStatement() && !parentPath.isSequenceExpression() || path.isCompletionRecord()) {
    ref = scope.generateUidIdentifierBasedOnNode(node.right, "ref");
    nodes.push(types.variableDeclaration("var", [types.variableDeclarator(ref, node.right)]));

    if (types.isArrayExpression(node.right)) {
      destructuring.arrayRefSet.add(ref.name);
    }
  }

  destructuring.init(node.left, ref || node.right);

  if (ref) {
    if (parentPath.isArrowFunctionExpression()) {
      path.replaceWith(types.blockStatement([]));
      nodes.push(types.returnStatement(types.cloneNode(ref)));
    } else {
      nodes.push(types.expressionStatement(types.cloneNode(ref)));
    }
  }

  path.replaceWithMultiple(nodes);
  scope.crawl();
}

function variableDeclarationHasPattern(node) {
  for (const declar of node.declarations) {
    if (types.isPattern(declar.id)) {
      return true;
    }
  }
  return false;
}

const index = helperPluginUtils.declare((api, options) => {
  const {
    useBuiltIns = false
  } = options;

  const iterableIsArray = api.assumption("iterableIsArray") || options.loose || false;
  const arrayLikeIsIterable = api.assumption("arrayLikeIsIterable") || options.allowArrayLike || false;
  const objectRestNoSymbols = api.assumption("objectRestNoSymbols") || options.loose || false;

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
      ForXStatement(path) {
        const { node, scope } = path;
        const left = node.left;

        if (types.isPattern(left)) {
          const temp = scope.generateUidIdentifier("ref");
          node.left = types.variableDeclaration("var", [types.variableDeclarator(temp)]);
          path.ensureBlock();

          const statementBody = path.node.body.body;
          const nodes = [];

          if (statementBody.length === 0 && path.isCompletionRecord()) {
            nodes.unshift(types.expressionStatement(scope.buildUndefinedNode()));
          }
          nodes.unshift(types.expressionStatement(types.assignmentExpression("=", left, types.cloneNode(temp))));
          unshiftForXStatementBody(path, nodes);
          scope.crawl();
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
          scope: scope,
          nodes: nodes,
          arrayLikeIsIterable,
          iterableIsArray,
          objectRestNoSymbols,
          useBuiltIns,
          addHelper: name => this.addHelper(name)
        });

        destructuring.init(pattern, key);
        unshiftForXStatementBody(path, nodes);
        scope.crawl();
      },
      CatchClause({ node, scope }) {
        const pattern = node.param;

        if (!types.isPattern(pattern)) return;

        const ref = scope.generateUidIdentifier("ref");
        node.param = ref;

        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: "let",
          scope: scope,
          nodes: nodes,
          arrayLikeIsIterable,
          iterableIsArray,
          objectRestNoSymbols,
          useBuiltIns,
          addHelper: name => this.addHelper(name)
        });

        destructuring.init(pattern, ref);
        node.body.body = [...nodes, ...node.body.body];
        scope.crawl();
      },
      AssignmentExpression(path, state) {
        if (!types.isPattern(path.node.left)) return;
        convertAssignmentExpression(path, name => state.addHelper(name), arrayLikeIsIterable, iterableIsArray, objectRestNoSymbols, useBuiltIns);
      },
      VariableDeclaration(path, state) {
        const { node, parent } = path;
        if (types.isForXStatement(parent)) return;
        if (!parent || !path.container) return;
        if (!variableDeclarationHasPattern(node)) return;

        convertVariableDeclaration(path, name => state.addHelper(name), arrayLikeIsIterable, iterableIsArray, objectRestNoSymbols, useBuiltIns);
      }
    }
  };
});

exports.buildObjectExcludingKeys = buildObjectExcludingKeys;
exports.default = index;
exports.unshiftForXStatementBody = unshiftForXStatementBody;
//# sourceMappingURL=index.js.map
