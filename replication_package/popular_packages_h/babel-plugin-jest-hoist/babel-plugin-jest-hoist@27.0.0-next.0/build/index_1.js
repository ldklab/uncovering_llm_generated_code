'use strict';

const { default: template } = require('@babel/template');
const { default: types } = require('@babel/types');

const JEST_GLOBAL_NAME = 'jest';
const JEST_GLOBALS_MODULE_NAME = '@jest/globals';
const JEST_GLOBALS_MODULE_JEST_EXPORT_NAME = 'jest';
const hoistedVariables = new WeakSet();

const ALLOWED_IDENTIFIERS = new Set([
  'Array', 'ArrayBuffer', 'Boolean', 'BigInt', 'DataView', 'Date',
  'Error', 'EvalError', 'Float32Array', 'Float64Array', 'Function',
  'Generator', 'GeneratorFunction', 'Infinity', 'Int16Array', 'Int32Array',
  'Int8Array', 'InternalError', 'Intl', 'JSON', 'Map', 'Math', 'NaN',
  'Number', 'Object', 'Promise', 'Proxy', 'RangeError', 'ReferenceError',
  'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError',
  'URIError', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray',
  'WeakMap', 'WeakSet', 'arguments', 'console', 'expect', 'isNaN', 'jest',
  'parseFloat', 'parseInt', 'exports', 'require', 'module', '__filename',
  '__dirname', 'undefined', ...Object.getOwnPropertyNames(global)
]);

const IDVisitor = {
  ReferencedIdentifier(path, { ids }) {
    ids.add(path);
  },
  blacklist: ['TypeAnnotation', 'TSTypeAnnotation', 'TSTypeReference']
};

const FUNCTIONS = {
  mock(args) {
    if (args.length === 1) return args[0].isStringLiteral() || args[0].isLiteral();

    if ([2, 3].includes(args.length)) {
      const moduleFactory = args[1];

      if (!moduleFactory.isFunction()) {
        throw moduleFactory.buildCodeFrameError(
          'The second argument of `jest.mock` must be an inline function.\n',
          TypeError
        );
      }

      const ids = new Set();
      const parentScope = moduleFactory.parentPath.scope;
      moduleFactory.traverse(IDVisitor, { ids });

      for (const id of ids) {
        const { name } = id.node;
        let found = false;
        let scope = id.scope;
        
        while (scope !== parentScope) {
          if (scope.bindings[name]) {
            found = true;
            break;
          }
          scope = scope.parent;
        }

        if (found) continue;

        let isAllowedIdentifier =
          (scope.hasGlobal(name) && ALLOWED_IDENTIFIERS.has(name)) ||
          /^mock/i.test(name) ||
          /^(?:__)?cov/.test(name);

        if (!isAllowedIdentifier) {
          const binding = scope.bindings[name];
          if (binding?.path.isVariableDeclarator()) {
            const initNode = binding.path.node.init;
            if (initNode && binding.constant && scope.isPure(initNode, true)) {
              hoistedVariables.add(binding.path.node);
              isAllowedIdentifier = true;
            }
          }
        }

        if (!isAllowedIdentifier) {
          throw id.buildCodeFrameError(
            `The module factory of \`jest.mock()\` is not allowed to ` +
            `reference any out-of-scope variables.\nInvalid variable access: ${name}\n` +
            `Allowed objects: ${Array.from(ALLOWED_IDENTIFIERS).join(', ')}.\n` +
            `Note: This is a precaution to guard against uninitialized mock variables. ` +
            `If it is ensured that the mock is required lazily, variable names prefixed with ` +
            `'mock' (case insensitive) are permitted.\n`,
            ReferenceError
          );
        }
      }
      return true;
    }
    return false;
  },

  unmock: args => args.length === 1 && args[0].isStringLiteral(),
  deepUnmock: args => args.length === 1 && args[0].isStringLiteral(),
  disableAutomock: args => args.length === 0,
  enableAutomock: args => args.length === 0
};

const createJestObjectGetter = template.statement(`
function GETTER_NAME() {
  const { JEST_GLOBALS_MODULE_JEST_EXPORT_NAME } = require("JEST_GLOBALS_MODULE_NAME");
  GETTER_NAME = () => JEST_GLOBALS_MODULE_JEST_EXPORT_NAME;
  return JEST_GLOBALS_MODULE_JEST_EXPORT_NAME;
}
`);

const isJestObject = expression => {
  if (expression.isIdentifier() && expression.node.name === JEST_GLOBAL_NAME && !expression.scope.hasBinding(JEST_GLOBAL_NAME)) {
    return true;
  }
  if (expression.referencesImport(JEST_GLOBALS_MODULE_NAME, JEST_GLOBALS_MODULE_JEST_EXPORT_NAME)) {
    return true;
  }
  if (expression.isMemberExpression() && !expression.node.computed &&
    expression.get('object').referencesImport(JEST_GLOBALS_MODULE_NAME, '*') &&
    expression.node.property.type === 'Identifier' &&
    expression.node.property.name === JEST_GLOBALS_MODULE_JEST_EXPORT_NAME) {
    return true;
  }
  return false;
};

const extractJestObjExprIfHoistable = expr => {
  if (!expr.isCallExpression()) return null;

  const callee = expr.get('callee');
  const args = expr.get('arguments');

  if (!callee.isMemberExpression() || callee.node.computed) return null;

  const object = callee.get('object');
  const jestObjExpr = isJestObject(object) ? object : extractJestObjExprIfHoistable(object);

  if (!jestObjExpr) return null;

  const property = callee.get('property');
  const propertyName = property.node.name;
  const functionLooksHoistable = FUNCTIONS[propertyName]?.(args);
  
  return functionLooksHoistable ? jestObjExpr : null;
};

const jestPlugin = () => ({
  pre({ path: program }) {
    this.declareJestObjGetterIdentifier = () => {
      if (this.jestObjGetterIdentifier) return this.jestObjGetterIdentifier;

      this.jestObjGetterIdentifier = program.scope.generateUidIdentifier('getJestObj');
      program.unshiftContainer('body', [
        createJestObjectGetter({
          GETTER_NAME: this.jestObjGetterIdentifier.name,
          JEST_GLOBALS_MODULE_JEST_EXPORT_NAME,
          JEST_GLOBALS_MODULE_NAME
        })
      ]);
      return this.jestObjGetterIdentifier;
    };
  },

  visitor: {
    ExpressionStatement(exprStmt) {
      const jestObjExpr = extractJestObjExprIfHoistable(exprStmt.get('expression'));
      if (jestObjExpr) {
        jestObjExpr.replaceWith(types.callExpression(this.declareJestObjGetterIdentifier(), []));
      }
    }
  },

  post({ path: program }) {
    const self = this;
    visitBlock(program);
    program.traverse({ BlockStatement: visitBlock });

    function visitBlock(block) {
      const [varsHoistPoint, callsHoistPoint] = block.unshiftContainer('body', [
        types.emptyStatement(), types.emptyStatement()
      ]);

      block.traverse({
        CallExpression: visitCallExpr,
        VariableDeclarator: visitVariableDeclarator,
        blacklist: ['BlockStatement']
      });

      callsHoistPoint.remove();
      varsHoistPoint.remove();

      function visitCallExpr(callExpr) {
        const { node: { callee } } = callExpr;

        if (types.isIdentifier(callee) && callee.name === self.jestObjGetterIdentifier?.name) {
          const mockStmt = callExpr.getStatementParent();
          if (mockStmt) {
            const mockStmtParent = mockStmt.parentPath;
            if (mockStmtParent.isBlock()) {
              const mockStmtNode = mockStmt.node;
              mockStmt.remove();
              callsHoistPoint.insertBefore(mockStmtNode);
            }
          }
        }
      }

      function visitVariableDeclarator(varDecl) {
        if (hoistedVariables.has(varDecl.node)) {
          varDecl.parentPath.assertVariableDeclaration();
          const { kind, declarations } = varDecl.parent;

          if (declarations.length === 1) {
            varDecl.parentPath.remove();
          } else {
            varDecl.remove();
          }

          varsHoistPoint.insertBefore(types.variableDeclaration(kind, [varDecl.node]));
        }
      }
    }
  }
});

exports.default = jestPlugin;
