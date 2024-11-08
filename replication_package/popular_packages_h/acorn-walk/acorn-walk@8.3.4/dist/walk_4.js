(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], factory);
  } else {
    // Global
    root = typeof globalThis !== 'undefined' ? globalThis : root || self;
    factory((root.acorn = root.acorn || {}, root.acorn.walk = {}));
  }
})(this, (function (exports) {
  'use strict';

  // AST walker for ESTree-compatible trees.

  function simple(node, visitors, baseVisitor, state, override) {
    if (!baseVisitor) baseVisitor = base;
    (function walk(node, state, override) {
      const type = override || node.type;
      baseVisitor[type](node, state, walk);
      if (visitors[type]) visitors[type](node, state);
    })(node, state, override);
  }

  function ancestor(node, visitors, baseVisitor, state, override) {
    const ancestors = [];
    if (!baseVisitor) baseVisitor = base;
    (function walk(node, state, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, state, walk);
      if (visitors[type]) visitors[type](node, state || ancestors, ancestors);
      if (isNew) ancestors.pop();
    })(node, state, override);
  }

  function recursive(node, state, funcs, baseVisitor, override) {
    const visitor = funcs ? make(funcs, baseVisitor) : baseVisitor;
    (function walk(node, state, override) {
      visitor[override || node.type](node, state, walk);
    })(node, state, override);
  }

  function makeTest(test) {
    if (typeof test === "string") {
      return (type) => type === test;
    } else if (!test) {
      return () => true;
    } else {
      return test;
    }
  }

  const Found = function (node, state) {
    this.node = node;
    this.state = state;
  };

  function full(node, callback, baseVisitor, state, override) {
    if (!baseVisitor) baseVisitor = base;
    let last;
    (function walk(node, state, override) {
      const type = override || node.type;
      baseVisitor[type](node, state, walk);
      if (last !== node) {
        callback(node, state, type);
        last = node;
      }
    })(node, state, override);
  }

  function fullAncestor(node, callback, baseVisitor, state) {
    if (!baseVisitor) baseVisitor = base;
    const ancestors = [];
    let last;
    (function walk(node, state, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, state, walk);
      if (last !== node) {
        callback(node, state || ancestors, ancestors, type);
        last = node;
      }
      if (isNew) ancestors.pop();
    })(node, state);
  }

  function findNodeAt(node, start, end, test, baseVisitor, state) {
    if (!baseVisitor) baseVisitor = base;
    test = makeTest(test);
    try {
      (function walk(node, state, override) {
        const type = override || node.type;
        if ((start == null || node.start <= start) && (end == null || node.end >= end)) {
          baseVisitor[type](node, state, walk);
        }
        if ((start == null || node.start === start) && (end == null || node.end === end) && test(type, node)) {
          throw new Found(node, state);
        }
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeAround(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    if (!baseVisitor) baseVisitor = base;
    try {
      (function walk(node, state, override) {
        const type = override || node.type;
        if (node.start > pos || node.end < pos) return;
        baseVisitor[type](node, state, walk);
        if (test(type, node)) throw new Found(node, state);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeAfter(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    if (!baseVisitor) baseVisitor = base;
    try {
      (function walk(node, state, override) {
        if (node.end < pos) return;
        const type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, state);
        baseVisitor[type](node, state, walk);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeBefore(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    if (!baseVisitor) baseVisitor = base;
    let max;
    (function walk(node, state, override) {
      if (node.start > pos) return;
      const type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node)) {
        max = new Found(node, state);
      }
      baseVisitor[type](node, state, walk);
    })(node, state);
    return max;
  }

  function make(funcs, baseVisitor) {
    const visitor = Object.create(baseVisitor || base);
    for (const type in funcs) {
      visitor[type] = funcs[type];
    }
    return visitor;
  }

  function skipThrough(node, state, delegate) {
    delegate(node, state);
  }

  function ignore() {}

  const base = {};

  base.Program = base.BlockStatement = base.StaticBlock = function (node, state, delegate) {
    for (let stmt of node.body) {
      delegate(stmt, state, "Statement");
    }
  };

  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
    (node, state, delegate) => delegate(node.expression, state, "Expression");

  base.IfStatement = function (node, state, delegate) {
    delegate(node.test, state, "Expression");
    delegate(node.consequent, state, "Statement");
    if (node.alternate) {
      delegate(node.alternate, state, "Statement");
    }
  };

  base.LabeledStatement = (node, state, delegate) => delegate(node.body, state, "Statement");
  base.BreakStatement = base.ContinueStatement = ignore;

  base.WithStatement = function (node, state, delegate) {
    delegate(node.object, state, "Expression");
    delegate(node.body, state, "Statement");
  };

  base.SwitchStatement = function (node, state, delegate) {
    delegate(node.discriminant, state, "Expression");
    for (let cs of node.cases) {
      delegate(cs, state);
    }
  };

  base.SwitchCase = function (node, state, delegate) {
    if (node.test) {
      delegate(node.test, state, "Expression");
    }
    for (let cons of node.consequent) {
      delegate(cons, state, "Statement");
    }
  };

  base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, state, delegate) {
    if (node.argument) {
      delegate(node.argument, state, "Expression");
    }
  };

  base.ThrowStatement = base.SpreadElement =
    (node, state, delegate) => delegate(node.argument, state, "Expression");

  base.TryStatement = function (node, state, delegate) {
    delegate(node.block, state, "Statement");
    if (node.handler) {
      delegate(node.handler, state);
    }
    if (node.finalizer) {
      delegate(node.finalizer, state, "Statement");
    }
  };

  base.CatchClause = function (node, state, delegate) {
    if (node.param) {
      delegate(node.param, state, "Pattern");
    }
    delegate(node.body, state, "Statement");
  };

  base.WhileStatement = base.DoWhileStatement = function (node, state, delegate) {
    delegate(node.test, state, "Expression");
    delegate(node.body, state, "Statement");
  };

  base.ForStatement = function (node, state, delegate) {
    if (node.init) {
      delegate(node.init, state, "ForInit");
    }
    if (node.test) {
      delegate(node.test, state, "Expression");
    }
    if (node.update) {
      delegate(node.update, state, "Expression");
    }
    delegate(node.body, state, "Statement");
  };

  base.ForInStatement = base.ForOfStatement = function (node, state, delegate) {
    delegate(node.left, state, "ForInit");
    delegate(node.right, state, "Expression");
    delegate(node.body, state, "Statement");
  };

  base.ForInit = function (node, state, delegate) {
    if (node.type === "VariableDeclaration") {
      delegate(node, state);
    } else {
      delegate(node, state, "Expression");
    }
  };

  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = (node, state, delegate) => delegate(node, state, "Function");

  base.VariableDeclaration = function (node, state, delegate) {
    for (let decl of node.declarations) {
      delegate(decl, state);
    }
  };

  base.VariableDeclarator = function (node, state, delegate) {
    delegate(node.id, state, "Pattern");
    if (node.init) {
      delegate(node.init, state, "Expression");
    }
  };

  base.Function = function (node, state, delegate) {
    if (node.id) {
      delegate(node.id, state, "Pattern");
    }
    for (let param of node.params) {
      delegate(param, state, "Pattern");
    }
    delegate(node.body, state, node.expression ? "Expression" : "Statement");
  };

  base.Pattern = function (node, state, delegate) {
    if (node.type === "Identifier") {
      delegate(node, state, "VariablePattern");
    } else if (node.type === "MemberExpression") {
      delegate(node, state, "MemberPattern");
    } else {
      delegate(node, state);
    }
  };

  base.VariablePattern = ignore;
  base.MemberPattern = skipThrough;

  base.RestElement = (node, state, delegate) => delegate(node.argument, state, "Pattern");

  base.ArrayPattern = function (node, state, delegate) {
    for (let elt of node.elements) {
      if (elt) {
        delegate(elt, state, "Pattern");
      }
    }
  };

  base.ObjectPattern = function (node, state, delegate) {
    for (let prop of node.properties) {
      if (prop.type === "Property") {
        if (prop.computed) {
          delegate(prop.key, state, "Expression");
        }
        delegate(prop.value, state, "Pattern");
      } else if (prop.type === "RestElement") {
        delegate(prop.argument, state, "Pattern");
      }
    }
  };

  base.Expression = skipThrough;
  base.ThisExpression = base.Super = base.MetaProperty = ignore;

  base.ArrayExpression = function (node, state, delegate) {
    for (let elt of node.elements) {
      if (elt) {
        delegate(elt, state, "Expression");
      }
    }
  };

  base.ObjectExpression = function (node, state, delegate) {
    for (let prop of node.properties) {
      delegate(prop, state);
    }
  };

  base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;

  base.SequenceExpression = function (node, state, delegate) {
    for (let expr of node.expressions) {
      delegate(expr, state, "Expression");
    }
  };

  base.TemplateLiteral = function (node, state, delegate) {
    for (let quasi of node.quasis) {
      delegate(quasi, state);
    }
    for (let expr of node.expressions) {
      delegate(expr, state, "Expression");
    }
  };

  base.TemplateElement = ignore;

  base.UnaryExpression = base.UpdateExpression = function (node, state, delegate) {
    delegate(node.argument, state, "Expression");
  };

  base.BinaryExpression = base.LogicalExpression = function (node, state, delegate) {
    delegate(node.left, state, "Expression");
    delegate(node.right, state, "Expression");
  };

  base.AssignmentExpression = base.AssignmentPattern = function (node, state, delegate) {
    delegate(node.left, state, "Pattern");
    delegate(node.right, state, "Expression");
  };

  base.ConditionalExpression = function (node, state, delegate) {
    delegate(node.test, state, "Expression");
    delegate(node.consequent, state, "Expression");
    delegate(node.alternate, state, "Expression");
  };

  base.NewExpression = base.CallExpression = function (node, state, delegate) {
    delegate(node.callee, state, "Expression");
    if (node.arguments) {
      for (let arg of node.arguments) {
        delegate(arg, state, "Expression");
      }
    }
  };

  base.MemberExpression = function (node, state, delegate) {
    delegate(node.object, state, "Expression");
    if (node.computed) {
      delegate(node.property, state, "Expression");
    }
  };

  base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, state, delegate) {
    if (node.declaration) {
      delegate(node.declaration, state, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
    }
    if (node.source) {
      delegate(node.source, state, "Expression");
    }
  };

  base.ExportAllDeclaration = function (node, state, delegate) {
    if (node.exported) {
      delegate(node.exported, state);
    }
    delegate(node.source, state, "Expression");
  };

  base.ImportDeclaration = function (node, state, delegate) {
    for (let spec of node.specifiers) {
      delegate(spec, state);
    }
    delegate(node.source, state, "Expression");
  };

  base.ImportExpression = (node, state, delegate) => delegate(node.source, state, "Expression");

  base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.PrivateIdentifier = base.Literal = ignore;

  base.TaggedTemplateExpression = function (node, state, delegate) {
    delegate(node.tag, state, "Expression");
    delegate(node.quasi, state, "Expression");
  };

  base.ClassDeclaration = base.ClassExpression = (node, state, delegate) => delegate(node, state, "Class");

  base.Class = function (node, state, delegate) {
    if (node.id) {
      delegate(node.id, state, "Pattern");
    }
    if (node.superClass) {
      delegate(node.superClass, state, "Expression");
    }
    delegate(node.body, state);
  };

  base.ClassBody = function (node, state, delegate) {
    for (let elt of node.body) {
      delegate(elt, state);
    }
  };

  base.MethodDefinition = base.PropertyDefinition = base.Property = function (node, state, delegate) {
    if (node.computed) {
      delegate(node.key, state, "Expression");
    }
    if (node.value) {
      delegate(node.value, state, "Expression");
    }
  };

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

}));
