(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    root = root || self;
    factory((root.acorn = root.acorn || {}, root.acorn.walk = {}));
  }
}(this, function (exports) {
  'use strict';

  function simple(node, visitors, baseVisitor, state, override) {
    if (!baseVisitor) baseVisitor = base;
    (function visit(node, st, override) {
      const type = override || node.type;
      const found = visitors[type];
      baseVisitor[type](node, st, visit);
      if (found) found(node, st);
    })(node, state, override);
  }

  function ancestor(node, visitors, baseVisitor, state, override) {
    const ancestors = [];
    if (!baseVisitor) baseVisitor = base;
    (function visit(node, st, override) {
      const type = override || node.type;
      const found = visitors[type];
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, visit);
      if (found) found(node, st || ancestors, ancestors);
      if (isNew) ancestors.pop();
    })(node, state, override);
  }

  function recursive(node, state, funcs, baseVisitor, override) {
    const visitor = funcs ? make(funcs, baseVisitor) : baseVisitor;
    (function visit(node, st, override) {
      visitor[override || node.type](node, st, visit);
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

  class Found {
    constructor(node, state) {
      this.node = node;
      this.state = state;
    }
  }

  function full(node, callback, baseVisitor, state, override) {
    if (!baseVisitor) baseVisitor = base;
    (function visit(node, st, override) {
      const type = override || node.type;
      baseVisitor[type](node, st, visit);
      if (!override) callback(node, st, type);
    })(node, state, override);
  }

  function fullAncestor(node, callback, baseVisitor, state) {
    if (!baseVisitor) baseVisitor = base;
    const ancestors = [];
    (function visit(node, st, override) {
      const type = override || node.type;
      const isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      baseVisitor[type](node, st, visit);
      if (!override) callback(node, st || ancestors, ancestors, type);
      if (isNew) ancestors.pop();
    })(node, state);
  }

  function findNodeAt(node, start, end, test, baseVisitor, state) {
    if (!baseVisitor) baseVisitor = base;
    test = makeTest(test);
    try {
      (function visit(node, st, override) {
        const type = override || node.type;
        if ((start == null || node.start <= start) && (end == null || node.end >= end)) {
          baseVisitor[type](node, st, visit);
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
    if (!baseVisitor) baseVisitor = base;
    try {
      (function visit(node, st, override) {
        const type = override || node.type;
        if (node.start > pos || node.end < pos) return;
        baseVisitor[type](node, st, visit);
        if (test(type, node)) throw new Found(node, st);
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
      (function visit(node, st, override) {
        if (node.end < pos) return;
        const type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, st);
        baseVisitor[type](node, st, visit);
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
    (function visit(node, st, override) {
      if (node.start > pos) return;
      const type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node)) {
        max = new Found(node, st);
      }
      baseVisitor[type](node, st, visit);
    })(node, state);
    return max;
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

  function skipThrough(node, st, visit) {
    visit(node, st);
  }

  function ignore(_node, _st, _visit) {}

  const base = {};

  base.Program = base.BlockStatement = function (node, st, visit) {
    for (const stmt of node.body) {
      visit(stmt, st, "Statement");
    }
  };
  
  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression = function (node, st, visit) {
    visit(node.expression, st, "Expression");
  };

  base.IfStatement = function (node, st, visit) {
    visit(node.test, st, "Expression");
    visit(node.consequent, st, "Statement");
    if (node.alternate) visit(node.alternate, st, "Statement");
  };

  base.LabeledStatement = function (node, st, visit) {
    visit(node.body, st, "Statement");
  };

  base.BreakStatement = base.ContinueStatement = ignore;

  base.WithStatement = function (node, st, visit) {
    visit(node.object, st, "Expression");
    visit(node.body, st, "Statement");
  };

  base.SwitchStatement = function (node, st, visit) {
    visit(node.discriminant, st, "Expression");
    for (const cs of node.cases) {
      if (cs.test) visit(cs.test, st, "Expression");
      for (const cons of cs.consequent) {
        visit(cons, st, "Statement");
      }
    }
  };

  base.SwitchCase = function (node, st, visit) {
    if (node.test) visit(node.test, st, "Expression");
    for (const cons of node.consequent) {
      visit(cons, st, "Statement");
    }
  };

  base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, visit) {
    if (node.argument) visit(node.argument, st, "Expression");
  };

  base.ThrowStatement = base.SpreadElement = function (node, st, visit) {
    visit(node.argument, st, "Expression");
  };

  base.TryStatement = function (node, st, visit) {
    visit(node.block, st, "Statement");
    if (node.handler) visit(node.handler, st);
    if (node.finalizer) visit(node.finalizer, st, "Statement");
  };

  base.CatchClause = function (node, st, visit) {
    if (node.param) visit(node.param, st, "Pattern");
    visit(node.body, st, "Statement");
  };

  base.WhileStatement = base.DoWhileStatement = function (node, st, visit) {
    visit(node.test, st, "Expression");
    visit(node.body, st, "Statement");
  };

  base.ForStatement = function (node, st, visit) {
    if (node.init) visit(node.init, st, "ForInit");
    if (node.test) visit(node.test, st, "Expression");
    if (node.update) visit(node.update, st, "Expression");
    visit(node.body, st, "Statement");
  };

  base.ForInStatement = base.ForOfStatement = function (node, st, visit) {
    visit(node.left, st, "ForInit");
    visit(node.right, st, "Expression");
    visit(node.body, st, "Statement");
  };

  base.ForInit = function (node, st, visit) {
    if (node.type === "VariableDeclaration") visit(node, st);
    else visit(node, st, "Expression");
  };

  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = function (node, st, visit) {
    visit(node, st, "Function");
  };

  base.VariableDeclaration = function (node, st, visit) {
    for (const decl of node.declarations) {
      visit(decl, st);
    }
  };

  base.VariableDeclarator = function (node, st, visit) {
    visit(node.id, st, "Pattern");
    if (node.init) visit(node.init, st, "Expression");
  };

  base.Function = function (node, st, visit) {
    if (node.id) visit(node.id, st, "Pattern");
    for (const param of node.params) {
      visit(param, st, "Pattern");
    }
    visit(node.body, st, node.expression ? "Expression" : "Statement");
  };

  base.Pattern = function (node, st, visit) {
    if (node.type === "Identifier") {
      visit(node, st, "VariablePattern");
    } else if (node.type === "MemberExpression") {
      visit(node, st, "MemberPattern");
    } else {
      visit(node, st);
    }
  };

  base.VariablePattern = ignore;
  base.MemberPattern = skipThrough;
  base.RestElement = function (node, st, visit) {
    visit(node.argument, st, "Pattern");
  };

  base.ArrayPattern = function (node, st, visit) {
    for (const elt of node.elements) {
      if (elt) visit(elt, st, "Pattern");
    }
  };

  base.ObjectPattern = function (node, st, visit) {
    for (const prop of node.properties) {
      if (prop.type === "Property") {
        if (prop.computed) visit(prop.key, st, "Expression");
        visit(prop.value, st, "Pattern");
      } else if (prop.type === "RestElement") {
        visit(prop.argument, st, "Pattern");
      }
    }
  };

  base.Expression = skipThrough;
  base.ThisExpression = base.Super = base.MetaProperty = ignore;
  base.ArrayExpression = function (node, st, visit) {
    for (const elt of node.elements) {
      if (elt) visit(elt, st, "Expression");
    }
  };

  base.ObjectExpression = function (node, st, visit) {
    for (const prop of node.properties) {
      visit(prop, st);
    }
  };

  base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;

  base.SequenceExpression = function (node, st, visit) {
    for (const expr of node.expressions) {
      visit(expr, st, "Expression");
    }
  };

  base.TemplateLiteral = function (node, st, visit) {
    for (const quasi of node.quasis) {
      visit(quasi, st);
    }

    for (const expr of node.expressions) {
      visit(expr, st, "Expression");
    }
  };

  base.TemplateElement = ignore;

  base.UnaryExpression = base.UpdateExpression = function (node, st, visit) {
    visit(node.argument, st, "Expression");
  };

  base.BinaryExpression = base.LogicalExpression = function (node, st, visit) {
    visit(node.left, st, "Expression");
    visit(node.right, st, "Expression");
  };

  base.AssignmentExpression = base.AssignmentPattern = function (node, st, visit) {
    visit(node.left, st, "Pattern");
    visit(node.right, st, "Expression");
  };

  base.ConditionalExpression = function (node, st, visit) {
    visit(node.test, st, "Expression");
    visit(node.consequent, st, "Expression");
    visit(node.alternate, st, "Expression");
  };

  base.NewExpression = base.CallExpression = function (node, st, visit) {
    visit(node.callee, st, "Expression");
    if (node.arguments) {
      for (const arg of node.arguments) {
        visit(arg, st, "Expression");
      }
    }
  };

  base.MemberExpression = function (node, st, visit) {
    visit(node.object, st, "Expression");
    if (node.computed) visit(node.property, st, "Expression");
  };

  base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, visit) {
    if (node.declaration) {
      visit(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
    }
    if (node.source) visit(node.source, st, "Expression");
  };

  base.ExportAllDeclaration = function (node, st, visit) {
    if (node.exported) visit(node.exported, st);
    visit(node.source, st, "Expression");
  };

  base.ImportDeclaration = function (node, st, visit) {
    for (const spec of node.specifiers) {
      visit(spec, st);
    }
    visit(node.source, st, "Expression");
  };

  base.ImportExpression = function (node, st, visit) {
    visit(node.source, st, "Expression");
  };

  base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;

  base.TaggedTemplateExpression = function (node, st, visit) {
    visit(node.tag, st, "Expression");
    visit(node.quasi, st, "Expression");
  };

  base.ClassDeclaration = base.ClassExpression = function (node, st, visit) {
    visit(node, st, "Class");
  };

  base.Class = function (node, st, visit) {
    if (node.id) visit(node.id, st, "Pattern");
    if (node.superClass) visit(node.superClass, st, "Expression");
    visit(node.body, st);
  };

  base.ClassBody = function (node, st, visit) {
    for (const elt of node.body) {
      visit(elt, st);
    }
  };

  base.MethodDefinition = base.Property = function (node, st, visit) {
    if (node.computed) visit(node.key, st, "Expression");
    visit(node.value, st, "Expression");
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
}));
