(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], factory);
  } else {
    // Global variable
    root = typeof globalThis !== 'undefined' ? globalThis : root || self;
    factory((root.acorn = root.acorn || {}, root.acorn.walk = {}));
  }
})(this, function (exports) {
  'use strict';

  function simple(node, visitors, baseVisitor = base, state, override) {
    (function recurse(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, recurse);
      if (visitors[type]) {
        visitors[type](node, st);
      }
    })(node, state, override);
  }

  function ancestor(node, visitors, baseVisitor = base, state, override) {
    const ancestors = [];
    (function recurse(node, st, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, recurse);
      if (visitors[type]) {
        visitors[type](node, st || ancestors, ancestors);
      }
      if (isNew) ancestors.pop();
    })(node, state, override);
  }

  function recursive(node, state, funcs, baseVisitor = undefined, override) {
    const visitor = funcs ? make(funcs, baseVisitor) : baseVisitor;
    (function recurse(node, st, override) {
      visitor[override || node.type](node, st, recurse);
    })(node, state, override);
  }

  function makeTest(test) {
    if (typeof test === "string")
      return function (type) { return type === test; }
    else if (!test)
      return function () { return true; }
    else
      return test;
  }

  class Found {
    constructor(node, state) {
      this.node = node;
      this.state = state;
    }
  }

  function full(node, callback, baseVisitor = base, state, override) {
    let lastNode;
    (function recurse(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, recurse);
      if (lastNode !== node) {
        callback(node, st, type);
        lastNode = node;
      }
    })(node, state, override);
  }

  function fullAncestor(node, callback, baseVisitor = base, state) {
    const ancestors = [];
    let lastNode;
    (function recurse(node, st, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, recurse);
      if (lastNode !== node) {
        callback(node, st || ancestors, ancestors, type);
        lastNode = node;
      }
      if (isNew) ancestors.pop();
    })(node, state);
  }

  function findNodeAt(node, start, end, test, baseVisitor = base, state) {
    test = makeTest(test);
    try {
      (function recurse(node, st, override) {
        const type = override || node.type;
        if ((start == null || node.start <= start) && (end == null || node.end >= end)) {
          baseVisitor[type](node, st, recurse);
        }
        if ((start == null || node.start === start) && (end == null || node.end === end) && test(type, node)) {
          throw new Found(node, st);
        }
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeAround(node, pos, test, baseVisitor = base, state) {
    test = makeTest(test);
    try {
      (function recurse(node, st, override) {
        const type = override || node.type;
        if (node.start > pos || node.end < pos) return;
        baseVisitor[type](node, st, recurse);
        if (test(type, node)) throw new Found(node, st);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeAfter(node, pos, test, baseVisitor = base, state) {
    test = makeTest(test);
    try {
      (function recurse(node, st, override) {
        if (node.end < pos) return;
        const type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, st);
        baseVisitor[type](node, st, recurse);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeBefore(node, pos, test, baseVisitor = base, state) {
    test = makeTest(test);
    let max;
    (function recurse(node, st, override) {
      if (node.start > pos) return;
      const type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node)) {
        max = new Found(node, st);
      }
      baseVisitor[type](node, st, recurse);
    })(node, state);
    return max;
  }

  function make(funcs, baseVisitor = base) {
    const visitor = Object.create(baseVisitor);
    for (const type in funcs) {
      visitor[type] = funcs[type];
    }
    return visitor;
  }

  function skipThrough(node, st, recurse) {
    recurse(node, st);
  }
  
  function ignore() {}

  const base = {
    Program: traverseBody,
    BlockStatement: traverseBody,
    StaticBlock: traverseBody,
    Statement: skipThrough,
    EmptyStatement: ignore,
    ExpressionStatement: simpleExpression,
    ParenthesizedExpression: simpleExpression,
    ChainExpression: simpleExpression,
    IfStatement: function (node, st, recurse) {
      recurse(node.test, st, "Expression");
      recurse(node.consequent, st, "Statement");
      if (node.alternate) {
        recurse(node.alternate, st, "Statement");
      }
    },
    LabeledStatement: function (node, st, recurse) {
      recurse(node.body, st, "Statement");
    },
    BreakStatement: ignore,
    ContinueStatement: ignore,
    WithStatement: function (node, st, recurse) {
      recurse(node.object, st, "Expression");
      recurse(node.body, st, "Statement");
    },
    SwitchStatement: function (node, st, recurse) {
      recurse(node.discriminant, st, "Expression");
      node.cases.forEach(cs => recurse(cs, st));
    },
    SwitchCase: function (node, st, recurse) {
      if (node.test) recurse(node.test, st, "Expression");
      node.consequent.forEach(cons => recurse(cons, st, "Statement"));
    },
    ReturnStatement: function (node, st, recurse) {
      if (node.argument) recurse(node.argument, st, "Expression");
    },
    YieldExpression: function (node, st, recurse) {
      if (node.argument) recurse(node.argument, st, "Expression");
    },
    AwaitExpression: function (node, st, recurse) {
      if (node.argument) recurse(node.argument, st, "Expression");
    },
    ThrowStatement: function (node, st, recurse) {
      recurse(node.argument, st, "Expression");
    },
    SpreadElement: function (node, st, recurse) {
      recurse(node.argument, st, "Expression");
    },
    TryStatement: function (node, st, recurse) {
      recurse(node.block, st, "Statement");
      if (node.handler) recurse(node.handler, st);
      if (node.finalizer) recurse(node.finalizer, st, "Statement");
    },
    CatchClause: function (node, st, recurse) {
      if (node.param) recurse(node.param, st, "Pattern");
      recurse(node.body, st, "Statement");
    },
    WhileStatement: loopStatement,
    DoWhileStatement: loopStatement,
    ForStatement: forStatement,
    ForInStatement: forOfInStatement,
    ForOfStatement: forOfInStatement,
    ForInit: forInit,
    DebuggerStatement: ignore,
    FunctionDeclaration: function (node, st, recurse) {
      recurse(node, st, "Function");
    },
    VariableDeclaration: function (node, st, recurse) {
      node.declarations.forEach(decl => recurse(decl, st));
    },
    VariableDeclarator: function (node, st, recurse) {
      recurse(node.id, st, "Pattern");
      if (node.init) recurse(node.init, st, "Expression");
    },
    Function: function (node, st, recurse) {
      if (node.id) recurse(node.id, st, "Pattern");
      node.params.forEach(param => recurse(param, st, "Pattern"));
      recurse(node.body, st, node.expression ? "Expression" : "Statement");
    },
    Pattern: function (node, st, recurse) {
      if (node.type === "Identifier") recurse(node, st, "VariablePattern");
      else if (node.type === "MemberExpression") recurse(node, st, "MemberPattern");
      else recurse(node, st);
    },
    VariablePattern: ignore,
    MemberPattern: skipThrough,
    RestElement: function (node, st, recurse) {
      recurse(node.argument, st, "Pattern");
    },
    ArrayPattern: function (node, st, recurse) {
      node.elements.forEach(elt => {
        if (elt) recurse(elt, st, "Pattern");
      });
    },
    ObjectPattern: function (node, st, recurse) {
      node.properties.forEach(prop => {
        if (prop.type === "Property") {
          if (prop.computed) recurse(prop.key, st, "Expression");
          recurse(prop.value, st, "Pattern");
        } else if (prop.type === "RestElement") {
          recurse(prop.argument, st, "Pattern");
        }
      });
    },
    Expression: skipThrough,
    ThisExpression: ignore,
    Super: ignore,
    MetaProperty: ignore,
    ArrayExpression: function (node, st, recurse) {
      node.elements.forEach(elt => {
        if (elt) recurse(elt, st, "Expression");
      });
    },
    ObjectExpression: function (node, st, recurse) {
      node.properties.forEach(prop => recurse(prop, st));
    },
    FunctionExpression: functionDeclaration,
    ArrowFunctionExpression: functionDeclaration,
    SequenceExpression: function (node, st, recurse) {
      node.expressions.forEach(expr => recurse(expr, st, "Expression"));
    },
    TemplateLiteral: function (node, st, recurse) {
      node.quasis.forEach(quasi => recurse(quasi, st));
      node.expressions.forEach(expr => recurse(expr, st, "Expression"));
    },
    TemplateElement: ignore,
    UnaryExpression: function (node, st, recurse) {
      recurse(node.argument, st, "Expression");
    },
    UpdateExpression: function (node, st, recurse) {
      recurse(node.argument, st, "Expression");
    },
    BinaryExpression: binaryLogicalExpression,
    LogicalExpression: binaryLogicalExpression,
    AssignmentExpression: assignmentExpressionPattern,
    AssignmentPattern: assignmentExpressionPattern,
    ConditionalExpression: function (node, st, recurse) {
      recurse(node.test, st, "Expression");
      recurse(node.consequent, st, "Expression");
      recurse(node.alternate, st, "Expression");
    },
    NewExpression: callNewExpression,
    CallExpression: callNewExpression,
    MemberExpression: function (node, st, recurse) {
      recurse(node.object, st, "Expression");
      if (node.computed) recurse(node.property, st, "Expression");
    },
    ExportNamedDeclaration: exportDeclaration,
    ExportDefaultDeclaration: exportDeclaration,
    ExportAllDeclaration: function (node, st, recurse) {
      if (node.exported) recurse(node.exported, st);
      recurse(node.source, st, "Expression");
    },
    ImportDeclaration: function (node, st, recurse) {
      node.specifiers.forEach(spec => recurse(spec, st));
      recurse(node.source, st, "Expression");
    },
    ImportExpression: function (node, st, recurse) {
      recurse(node.source, st, "Expression");
    },
    ImportSpecifier: ignore,
    ImportDefaultSpecifier: ignore,
    ImportNamespaceSpecifier: ignore,
    Identifier: ignore,
    PrivateIdentifier: ignore,
    Literal: ignore,
    TaggedTemplateExpression: function (node, st, recurse) {
      recurse(node.tag, st, "Expression");
      recurse(node.quasi, st, "Expression");
    },
    ClassDeclaration: function (node, st, recurse) {
      recurse(node, st, "Class");
    },
    ClassExpression: function (node, st, recurse) {
      recurse(node, st, "Class");
    },
    Class: function (node, st, recurse) {
      if (node.id) recurse(node.id, st, "Pattern");
      if (node.superClass) recurse(node.superClass, st, "Expression");
      recurse(node.body, st);
    },
    ClassBody: function (node, st, recurse) {
      node.body.forEach(elt => recurse(elt, st));
    },
    MethodDefinition: propertyDefinition,
    PropertyDefinition: propertyDefinition,
    Property: propertyDefinition
  };

  function traverseBody(node, st, recurse) {
    node.body.forEach(stmt => recurse(stmt, st, "Statement"));
  }

  function simpleExpression(node, st, recurse) {
    recurse(node.expression, st, "Expression");
  }

  function loopStatement(node, st, recurse) {
    recurse(node.test, st, "Expression");
    recurse(node.body, st, "Statement");
  }

  function forStatement(node, st, recurse) {
    if (node.init) recurse(node.init, st, "ForInit");
    if (node.test) recurse(node.test, st, "Expression");
    if (node.update) recurse(node.update, st, "Expression");
    recurse(node.body, st, "Statement");
  }

  function forOfInStatement(node, st, recurse) {
    recurse(node.left, st, "ForInit");
    recurse(node.right, st, "Expression");
    recurse(node.body, st, "Statement");
  }

  function forInit(node, st, recurse) {
    if (node.type === "VariableDeclaration") recurse(node, st);
    else recurse(node, st, "Expression");
  }

  function functionDeclaration(node, st, recurse) {
    node.params.forEach(param => recurse(param, st, "Pattern"));
    recurse(node.body, st, node.expression ? "Expression" : "Statement");
  }

  function binaryLogicalExpression(node, st, recurse) {
    recurse(node.left, st, "Expression");
    recurse(node.right, st, "Expression");
  }

  function assignmentExpressionPattern(node, st, recurse) {
    recurse(node.left, st, "Pattern");
    recurse(node.right, st, "Expression");
  }

  function callNewExpression(node, st, recurse) {
    recurse(node.callee, st, "Expression");
    if (node.arguments) {
      node.arguments.forEach(arg => recurse(arg, st, "Expression"));
    }
  }

  function exportDeclaration(node, st, recurse) {
    if (node.declaration) {
      recurse(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
    }
    if (node.source) {
      recurse(node.source, st, "Expression");
    }
  }

  function propertyDefinition(node, st, recurse) {
    if (node.computed) {
      recurse(node.key, st, "Expression");
    }
    if (node.value) {
      recurse(node.value, st, "Expression");
    }
  }

  exports.ancestor = ancestor;
  exports.base = base;
  exports.findNodeAfter = findNodeAfter;
  exports.findNodeAround = findNodeAround;
  exports.findNodeAt = findNodeAt;
  exports.findNodeBefore = findNodeBefore;
  exports.full = full;
  exports.fullAncestor = fullAncestor;
  exports.make = make;
  exports.recursive = recursive;
  exports.simple = simple;
});
