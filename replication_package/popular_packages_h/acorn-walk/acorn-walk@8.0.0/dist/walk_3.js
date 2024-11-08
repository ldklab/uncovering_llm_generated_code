(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory((global.acorn = global.acorn || {}, global.acorn.walk = {}));
  }
}(this, (function (exports) {
  'use strict';

  function simple(node, visitors, baseVisitor, state, override) {
    baseVisitor = baseVisitor || base;
    (function c(node, st, override) {
      const type = override || node.type;
      const found = visitors[type];
      baseVisitor[type](node, st, c);
      if (found) found(node, st);
    })(node, state, override);
  }

  function ancestor(node, visitors, baseVisitor, state, override) {
    let ancestors = [];
    baseVisitor = baseVisitor || base;
    (function c(node, st, override) {
      const type = override || node.type;
      const found = visitors[type];
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, c);
      if (found) found(node, st || ancestors, ancestors);
      if (isNew) ancestors.pop();
    })(node, state, override);
  }

  function recursive(node, state, funcs, baseVisitor, override) {
    const visitor = funcs ? make(funcs, baseVisitor || undefined) : baseVisitor;
    (function c(node, st, override) {
      visitor[override || node.type](node, st, c);
    })(node, state, override);
  }

  function full(node, callback, baseVisitor, state, override) {
    baseVisitor = baseVisitor || base;
    (function c(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, c);
      if (!override) callback(node, st, type);
    })(node, state, override);
  }

  function fullAncestor(node, callback, baseVisitor, state) {
    baseVisitor = baseVisitor || base;
    let ancestors = [];
    (function c(node, st, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, c);
      if (!override) callback(node, st || ancestors, ancestors, type);
      if (isNew) ancestors.pop();
    })(node, state);
  }

  const Found = function(node, state) {
    this.node = node;
    this.state = state;
  };

  function findNodeAt(node, start, end, test, baseVisitor, state) {
    baseVisitor = baseVisitor || base;
    test = makeTest(test);
    try {
      (function c(node, st, override) {
        const type = override || node.type;
        if ((start == null || node.start <= start) && (end == null || node.end >= end)) {
          baseVisitor[type](node, st, c);
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

  function findNodeAround(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    baseVisitor = baseVisitor || base;
    try {
      (function c(node, st, override) {
        const type = override || node.type;
        if (node.start > pos || node.end < pos) return;
        baseVisitor[type](node, st, c);
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
      (function c(node, st, override) {
        if (node.end < pos) return;
        const type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, st);
        baseVisitor[type](node, st, c);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  }

  function findNodeBefore(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    baseVisitor = baseVisitor || base;
    let max;
    (function c(node, st, override) {
      if (node.start > pos) return;
      const type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node)) {
        max = new Found(node, st);
      }
      baseVisitor[type](node, st, c);
    })(node, state);
    return max;
  }

  function makeTest(test) {
    if (typeof test === "string") {
      return function (type) { return type === test; }
    } else if (!test) {
      return function () { return true; }
    } else {
      return test;
    }
  }

  const create = Object.create || function(proto) {
    function Ctor() {}
    Ctor.prototype = proto;
    return new Ctor();
  };

  function make(funcs, baseVisitor) {
    const visitor = create(baseVisitor || base);
    for (const type in funcs) {
      visitor[type] = funcs[type];
    }
    return visitor;
  }

  function skipThrough(node, st, c) { c(node, st); }
  function ignore(_node, _st, _c) {}

  const base = {};

  base.Program = base.BlockStatement = function (node, st, c) {
    for (let stmt of node.body) {
      c(stmt, st, "Statement");
    }
  };
  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
    function (node, st, c) { c(node.expression, st, "Expression"); };
  base.IfStatement = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Statement");
    if (node.alternate) c(node.alternate, st, "Statement");
  };
  base.LabeledStatement = function (node, st, c) { c(node.body, st, "Statement"); };
  base.BreakStatement = base.ContinueStatement = ignore;
  base.WithStatement = function (node, st, c) {
    c(node.object, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.SwitchStatement = function (node, st, c) {
    c(node.discriminant, st, "Expression");
    for (let cs of node.cases) {
      if (cs.test) c(cs.test, st, "Expression");
      for (let cons of cs.consequent) {
        c(cons, st, "Statement");
      }
    }
  };
  base.SwitchCase = function (node, st, c) {
    if (node.test) c(node.test, st, "Expression");
    for (let cons of node.consequent) {
      c(cons, st, "Statement");
    }
  };
  base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
    if (node.argument) c(node.argument, st, "Expression");
  };
  base.ThrowStatement = base.SpreadElement =
    function (node, st, c) { c(node.argument, st, "Expression"); };
  base.TryStatement = function (node, st, c) {
    c(node.block, st, "Statement");
    if (node.handler) c(node.handler, st);
    if (node.finalizer) c(node.finalizer, st, "Statement");
  };
  base.CatchClause = function (node, st, c) {
    if (node.param) c(node.param, st, "Pattern");
    c(node.body, st, "Statement");
  };
  base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForStatement = function (node, st, c) {
    if (node.init) c(node.init, st, "ForInit");
    if (node.test) c(node.test, st, "Expression");
    if (node.update) c(node.update, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInStatement = base.ForOfStatement = function (node, st, c) {
    c(node.left, st, "ForInit");
    c(node.right, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInit = function (node, st, c) {
    if (node.type === "VariableDeclaration") c(node, st);
    else c(node, st, "Expression");
  };
  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = function (node, st, c) { c(node, st, "Function"); };
  base.VariableDeclaration = function (node, st, c) {
    for (let decl of node.declarations) {
      c(decl, st);
    }
  };
  base.VariableDeclarator = function (node, st, c) {
    c(node.id, st, "Pattern");
    if (node.init) c(node.init, st, "Expression");
  };

  base.Function = function (node, st, c) {
    if (node.id) c(node.id, st, "Pattern");
    for (let param of node.params) {
      c(param, st, "Pattern");
    }
    c(node.body, st, node.expression ? "Expression" : "Statement");
  };

  base.Pattern = function (node, st, c) {
    if (node.type === "Identifier") {
      c(node, st, "VariablePattern");
    } else if (node.type === "MemberExpression") {
      c(node, st, "MemberPattern");
    } else {
      c(node, st);
    }
  };
  base.VariablePattern = ignore;
  base.MemberPattern = skipThrough;
  base.RestElement = function (node, st, c) { c(node.argument, st, "Pattern"); };
  base.ArrayPattern = function (node, st, c) {
    for (let elt of node.elements) {
      if (elt) c(elt, st, "Pattern");
    }
  };
  base.ObjectPattern = function (node, st, c) {
    for (let prop of node.properties) {
      if (prop.type === "Property") {
        if (prop.computed) c(prop.key, st, "Expression");
        c(prop.value, st, "Pattern");
      } else if (prop.type === "RestElement") {
        c(prop.argument, st, "Pattern");
      }
    }
  };

  base.Expression = skipThrough;
  base.ThisExpression = base.Super = base.MetaProperty = ignore;
  base.ArrayExpression = function (node, st, c) {
    for (let elt of node.elements) {
      if (elt) c(elt, st, "Expression");
    }
  };
  base.ObjectExpression = function (node, st, c) {
    for (let prop of node.properties) {
      c(prop, st);
    }
  };
  base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
  base.SequenceExpression = function (node, st, c) {
    for (let expr of node.expressions) {
      c(expr, st, "Expression");
    }
  };
  base.TemplateLiteral = function (node, st, c) {
    for (let quasi of node.quasis) {
      c(quasi, st);
    }
    for (let expr of node.expressions) {
      c(expr, st, "Expression");
    }
  };
  base.TemplateElement = ignore;
  base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
    c(node.argument, st, "Expression");
  };
  base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
    c(node.left, st, "Expression");
    c(node.right, st, "Expression");
  };
  base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
    c(node.left, st, "Pattern");
    c(node.right, st, "Expression");
  };
  base.ConditionalExpression = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Expression");
    c(node.alternate, st, "Expression");
  };
  base.NewExpression = base.CallExpression = function (node, st, c) {
    c(node.callee, st, "Expression");
    if (node.arguments) {
      for (let arg of node.arguments) {
        c(arg, st, "Expression");
      }
    }
  };
  base.MemberExpression = function (node, st, c) {
    c(node.object, st, "Expression");
    if (node.computed) c(node.property, st, "Expression");
  };
  base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
    if (node.declaration) {
      c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
    }
    if (node.source) c(node.source, st, "Expression");
  };
  base.ExportAllDeclaration = function (node, st, c) {
    if (node.exported) c(node.exported, st);
    c(node.source, st, "Expression");
  };
  base.ImportDeclaration = function (node, st, c) {
    for (let spec of node.specifiers) {
      c(spec, st);
    }
    c(node.source, st, "Expression");
  };
  base.ImportExpression = function (node, st, c) {
    c(node.source, st, "Expression");
  };
  base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;

  base.TaggedTemplateExpression = function (node, st, c) {
    c(node.tag, st, "Expression");
    c(node.quasi, st, "Expression");
  };
  base.ClassDeclaration = base.ClassExpression = function (node, st, c) { c(node, st, "Class"); };
  base.Class = function (node, st, c) {
    if (node.id) c(node.id, st, "Pattern");
    if (node.superClass) c(node.superClass, st, "Expression");
    c(node.body, st);
  };
  base.ClassBody = function (node, st, c) {
    for (let elt of node.body) {
      c(elt, st);
    }
  };
  base.MethodDefinition = base.Property = function (node, st, c) {
    if (node.computed) c(node.key, st, "Expression");
    c(node.value, st, "Expression");
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

  Object.defineProperty(exports, '__esModule', { value: true });

})));
