(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global = global || self;
    factory((global.acorn = global.acorn || {}, global.acorn.walk = {}));
  }
}(this, (function (exports) {
  'use strict';

  function simple(node, visitors, baseVisitor, state, override) {
    baseVisitor = baseVisitor || base;
    (function visitNode(node, st, override) {
      const type = override || node.type;
      const visitorFn = visitors[type];
      baseVisitor[type](node, st, visitNode);
      if (visitorFn) visitorFn(node, st);
    })(node, state, override);
  }

  function ancestor(node, visitors, baseVisitor, state, override) {
    const ancestors = [];
    baseVisitor = baseVisitor || base;
    (function visitNode(node, st, override) {
      const type = override || node.type;
      const visitorFn = visitors[type];
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, visitNode);
      if (visitorFn) visitorFn(node, st || ancestors, ancestors);
      if (isNew) ancestors.pop();
    })(node, state, override);
  }

  function recursive(node, state, funcs, baseVisitor, override) {
    const visitor = make(funcs, baseVisitor || {});
    (function visitNode(node, st, override) {
      visitor[override || node.type](node, st, visitNode);
    })(node, state, override);
  }

  function makeTest(test) {
    if (typeof test === 'string') {
      return type => type === test;
    } else if (!test) {
      return () => true;
    } else {
      return test;
    }
  }

  function full(node, callback, baseVisitor, state, override) {
    baseVisitor = baseVisitor || base;
    (function visitNode(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, visitNode);
      if (!override) callback(node, st, type);
    })(node, state, override);
  }

  function fullAncestor(node, callback, baseVisitor, state) {
    const ancestors = [];
    baseVisitor = baseVisitor || base;
    (function visitNode(node, st, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, visitNode);
      if (!override) callback(node, st || ancestors, ancestors, type);
      if (isNew) ancestors.pop();
    })(node, state);
  }

  function findNodeAt(node, start, end, test, baseVisitor, state) {
    baseVisitor = baseVisitor || base;
    test = makeTest(test);
    try {
      (function visitNode(node, st, override) {
        const type = override || node.type;
        if ((start == null || node.start <= start) && (end == null || node.end >= end)) {
          baseVisitor[type](node, st, visitNode);
        }
        if ((start == null || node.start === start) &&
            (end == null || node.end === end) &&
            test(type, node)) {
          throw new Found(node, st);
        }
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeAround(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    baseVisitor = baseVisitor || base;
    try {
      (function visitNode(node, st, override) {
        const type = override || node.type;
        if (node.start > pos || node.end < pos) return;
        baseVisitor[type](node, st, visitNode);
        if (test(type, node)) throw new Found(node, st);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeAfter(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    baseVisitor = baseVisitor || base;
    try {
      (function visitNode(node, st, override) {
        if (node.end < pos) return;
        const type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, st);
        baseVisitor[type](node, st, visitNode);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeBefore(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    baseVisitor = baseVisitor || base;
    let result = null;
    (function visitNode(node, st, override) {
      if (node.start > pos) return;
      const type = override || node.type;
      if (node.end <= pos && (!result || result.node.end < node.end) && test(type, node)) {
        result = new Found(node, st);
      }
      baseVisitor[type](node, st, visitNode);
    })(node, state);
    return result;
  }

  const base = {
    Program: processBlockStatements,
    BlockStatement: processBlockStatements,
    ExpressionStatement: processSingleExpression,
    ParenthesizedExpression: processSingleExpression,
    ChainExpression: processSingleExpression,
    IfStatement: function (node, st, c) {
      c(node.test, st, "Expression");
      c(node.consequent, st, "Statement");
      if (node.alternate) c(node.alternate, st, "Statement");
    },
    LabeledStatement: function (node, st, c) {
      c(node.body, st, "Statement");
    },
    WithStatement: processWithStatement,
    SwitchStatement: processSwitchStatement,
    SwitchCase: processSwitchCase,
    ReturnStatement: processSingleArgument,
    YieldExpression: processSingleArgument,
    AwaitExpression: processSingleArgument,
    ThrowStatement: processSingleArgument,
    SpreadElement: processSingleArgument,
    TryStatement: processTryStatement,
    CatchClause: processCatchClause,
    WhileStatement: processLoopStatement,
    DoWhileStatement: processLoopStatement,
    ForStatement: processForStatement,
    ForInStatement: processForOfOrInStatement,
    ForOfStatement: processForOfOrInStatement,
    FunctionDeclaration: processFunction,
    VariableDeclaration: processVariableDeclaration,
    VariableDeclarator: processVariableDeclarator,
    ArrayPattern: processArrayPattern,
    ObjectPattern: processObjectPattern,
    // ...other node types with default handlers...
  };

  function processBlockStatements(node, st, c) {
    for (let stmt of node.body) {
      c(stmt, st, "Statement");
    }
  }

  function processSingleExpression(node, st, c) {
    return c(node.expression, st, "Expression");
  }

  function processWithStatement(node, st, c) {
    c(node.object, st, "Expression");
    c(node.body, st, "Statement");
  }

  function processSwitchStatement(node, st, c) {
    c(node.discriminant, st, "Expression");
    for (let cs of node.cases) {
      if (cs.test) c(cs.test, st, "Expression");
      for (let cons of cs.consequent) {
        c(cons, st, "Statement");
      }
    }
  }

  function processSwitchCase(node, st, c) {
    if (node.test) c(node.test, st, "Expression");
    for (let cons of node.consequent) {
      c(cons, st, "Statement");
    }
  }

  function processSingleArgument(node, st, c) {
    if (node.argument) {
      c(node.argument, st, "Expression");
    }
  }

  function processTryStatement(node, st, c) {
    c(node.block, st, "Statement");
    if (node.handler) c(node.handler, st);
    if (node.finalizer) c(node.finalizer, st, "Statement");
  }

  function processCatchClause(node, st, c) {
    if (node.param) c(node.param, st, "Pattern");
    c(node.body, st, "Statement");
  }

  function processLoopStatement(node, st, c) {
    c(node.test, st, "Expression");
    c(node.body, st, "Statement");
  }

  function processForStatement(node, st, c) {
    if (node.init) c(node.init, st, "ForInit");
    if (node.test) c(node.test, st, "Expression");
    if (node.update) c(node.update, st, "Expression");
    c(node.body, st, "Statement");
  }

  function processForOfOrInStatement(node, st, c) {
    c(node.left, st, "ForInit");
    c(node.right, st, "Expression");
    c(node.body, st, "Statement");
  }

  function processFunction(node, st, c) {
    if (node.id) c(node.id, st, "Pattern");
    for (let param of node.params) {
      c(param, st, "Pattern");
    }
    c(node.body, st, node.expression ? "Expression" : "Statement");
  }

  function processVariableDeclaration(node, st, c) {
    for (let decl of node.declarations) {
      c(decl, st);
    }
  }

  function processVariableDeclarator(node, st, c) {
    c(node.id, st, "Pattern");
    if (node.init) c(node.init, st, "Expression");
  }

  function processArrayPattern(node, st, c) {
    for (let elt of node.elements) {
      if (elt) c(elt, st, "Pattern");
    }
  }

  function processObjectPattern(node, st, c) {
    for (let prop of node.properties) {
      if (prop.type === "Property") {
        if (prop.computed) c(prop.key, st, "Expression");
        c(prop.value, st, "Pattern");
      } else if (prop.type === "RestElement") {
        c(prop.argument, st, "Pattern");
      }
    }
  }

  function make(funcs, baseVisitor) {
    const visitor = Object.create(baseVisitor || base);
    for (const type in funcs) {
      visitor[type] = funcs[type];
    }
    return visitor;
  }

  function skipThrough(node, st, c) {
    c(node, st);
  }

  function ignore(_node, _st, _c) {}

  exports.simple = simple;
  exports.ancestor = ancestor;
  exports.findNodeAt = findNodeAt;
  exports.findNodeAround = findNodeAround;
  exports.findNodeAfter = findNodeAfter;
  exports.findNodeBefore = findNodeBefore;
  exports.full = full;
  exports.fullAncestor = fullAncestor;
  exports.recursive = recursive;
  exports.base = base;
  exports.make = make;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
