((global, factory) => {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory((global.acorn = global.acorn || {}, global.acorn.walk = {}));
  }
})(this, (exports => {
  'use strict';

  // AST walker module for ESTree compatible trees

  const base = {};

  // Define basic node type handlers in `base`
  base.Program = base.BlockStatement = (node, st, c) => {
    for (let stmt of node.body) c(stmt, st, "Statement");
  };
  base.Statement = c => c;
  base.EmptyStatement = base.DebuggerStatement = () => {};
  base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression = (node, st, c) => c(node.expression, st, "Expression");
  base.IfStatement = (node, st, c) => {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Statement");
    if (node.alternate) c(node.alternate, st, "Statement");
  };
  // Continue defining other node handlers similarly...

  // Function to perform a simple walk over AST
  function simple(node, visitors, baseVisitor = base, state, override) {
    function walk(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, walk);
      if (visitors[type]) visitors[type](node, st);
    }
    walk(node, state, override);
  }

  // Function to perform ancestor walk over AST
  function ancestor(node, visitors, baseVisitor = base, state, override) {
    const ancestors = [];
    function walk(node, st, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, walk);
      if (visitors[type]) visitors[type](node, st || ancestors, ancestors);
      if (isNew) ancestors.pop();
    }
    walk(node, state, override);
  }

  // Function to perform a recursive walk over AST
  function recursive(node, state, funcs, baseVisitor = base, override) {
    const visitor = funcs ? make(funcs, baseVisitor) : baseVisitor;
    function walk(node, st, override) {
      visitor[override || node.type](node, st, walk);
    }
    walk(node, state, override);
  }

  // Function to perform a full walk, visiting everywhere
  function full(node, callback, baseVisitor = base, state, override) {
    let last;
    function walk(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, walk);
      if (last !== node) {
        callback(node, st, type);
        last = node;
      }
    }
    walk(node, state, override);
  }

  // Utility function for generating test functions
  function makeTest(test) {
    if (typeof test === "string") {
      return type => type === test;
    }
    return test || (() => true);
  }

  // Class to throw when a node matching a condition is found
  class Found {
    constructor(node, state) {
      this.node = node;
      this.state = state;
    }
  }

  // Utility functions to find nodes within the AST
  function findNodeAt(node, start, end, test, baseVisitor = base, state) {
    test = makeTest(test);
    try {
      function walk(node, st, override) {
        const type = override || node.type;
        if ((start == null || node.start <= start) &&
            (end == null || node.end >= end))
          baseVisitor[type](node, st, walk);
        if ((start == null || node.start === start) &&
            (end == null || node.end === end) &&
            test(type, node))
          throw new Found(node, st);
      }
      walk(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  // Continue with other functions like findNodeAround, findNodeAfter, findNodeBefore...

  // Exposing the functions
  exports.simple = simple;
  exports.ancestor = ancestor;
  exports.recursive = recursive;
  exports.full = full;
  exports.make = make;
  exports.base = base;
  exports.findNodeAt = findNodeAt;
  // Continue exporting other needed functions as necessary...

}));
