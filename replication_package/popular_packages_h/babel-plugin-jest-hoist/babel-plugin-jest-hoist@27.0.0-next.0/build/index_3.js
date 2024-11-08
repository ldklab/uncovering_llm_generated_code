'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;

const babelTemplate = require('@babel/template');
const babelTypes = require('@babel/types');

const JEST_GLOBAL_NAME = 'jest';
const JEST_GLOBALS_MODULE_NAME = '@jest/globals';
const JEST_GLOBALS_MODULE_JEST_EXPORT_NAME = 'jest';
const hoistedVariables = new WeakSet();

const ALLOWED_IDENTIFIERS = new Set(
  [
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
  ].sort()
);

const IDVisitor = {
  ReferencedIdentifier(path, { ids }) {
    ids.add(path);
  },
  blacklist: ['TypeAnnotation', 'TSTypeAnnotation', 'TSTypeReference']
};

const FUNCTIONS = Object.create(null);

FUNCTIONS.mock = args => {
  if (args.length === 1) {
    return args[0].isStringLiteral() || args[0].isLiteral();
  } else if (args.length >= 2) {
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

      if (!found) {
        let isAllowedIdentifier =
          (scope.hasGlobal(name) && ALLOWED_IDENTIFIERS.has(name)) ||
          /^mock/i.test(name) || 
          /^(?:__)?cov/.test(name);

        if (!isAllowedIdentifier) {
          const binding = scope.bindings[name];
          if (
            binding?.path.isVariableDeclarator() &&
            binding.constant &&
            scope.isPure(binding.path.node.init, true)
          ) {
            hoistedVariables.add(binding.path.node);
            isAllowedIdentifier = true;
          }
        }

        if (!isAllowedIdentifier) {
          throw id.buildCodeFrameError(
            `The module factory of \`jest.mock()\` cannot reference out-of-scope variables.\n` +
            `Invalid variable access: ${name}\nAllowed objects: ${Array.from(ALLOWED_IDENTIFIERS).join(', ')}.\n` +
            `Prefix with 'mock' to allow usage (case insensitive).\n`,
            ReferenceError
          );
        }
      }
    }

    return true;
  }

  return false;
};

FUNCTIONS.unmock = args => args.length === 1 && args[0].isStringLiteral();
FUNCTIONS.deepUnmock = args => args.length === 1 && args[0].isStringLiteral();
FUNCTIONS.disableAutomock = FUNCTIONS.enableAutomock = args => args.length === 0;

const createJestObjectGetter = babelTemplate.statement`
function GETTER_NAME() {
  const { JEST_GLOBALS_MODULE_JEST_EXPORT_NAME } = require("JEST_GLOBALS_MODULE_NAME");
  GETTER_NAME = () => JEST_GLOBALS_MODULE_JEST_EXPORT_NAME;
  return JEST_GLOBALS_MODULE_JEST_EXPORT_NAME;
}
`;

const isJestObject = expression => {
  if (
    expression.isIdentifier() &&
    expression.node.name === JEST_GLOBAL_NAME &&
    !expression.scope.hasBinding(JEST_GLOBAL_NAME)
  ) {
    return true;
  }
  if (
    expression.referencesImport(JEST_GLOBALS_MODULE_NAME, JEST_GLOBALS_MODULE_JEST_EXPORT_NAME)
  ) {
    return true;
  }
  if (
    expression.isMemberExpression() &&
    !expression.node.computed &&
    expression.get('object').referencesImport(JEST_GLOBALS_MODULE_NAME, '*') &&
    expression.node.property.type === 'Identifier' &&
    expression.node.property.name === JEST_GLOBALS_MODULE_JEST_EXPORT_NAME
  ) {
    return true;
  }

  return false;
};

const extractJestObjExprIfHoistable = expr => {
  if (!expr.isCallExpression()) {
    return null;
  }

  const callee = expr.get('callee');
  const args = expr.get('arguments');

  if (!callee.isMemberExpression() || callee.node.computed) {
    return null;
  }

  const object = callee.get('object');
  const property = callee.get('property');
  const propertyName = property.node.name;
  const jestObjExpr = isJestObject(object)
    ? object 
    : extractJestObjExprIfHoistable(object);

  if (!jestObjExpr) {
    return null;
  }

  const functionLooksHoistable = 
    FUNCTIONS[propertyName]?.call(FUNCTIONS, args);
  return functionLooksHoistable ? jestObjExpr : null;
};

var _default = () => ({
  pre({ path: program }) {
    this.declareJestObjGetterIdentifier = () => {
      if (!this.jestObjGetterIdentifier) {
        this.jestObjGetterIdentifier = program.scope.generateUidIdentifier('getJestObj');
        program.unshiftContainer('body', [
          createJestObjectGetter({
            GETTER_NAME: this.jestObjGetterIdentifier.name,
            JEST_GLOBALS_MODULE_JEST_EXPORT_NAME,
            JEST_GLOBALS_MODULE_NAME
          })
        ]);
      }
      return this.jestObjGetterIdentifier;
    };
  },

  visitor: {
    ExpressionStatement(exprStmt) {
      const jestObjExpr = extractJestObjExprIfHoistable(exprStmt.get('expression'));

      if (jestObjExpr) {
        jestObjExpr.replaceWith(
          babelTypes.callExpression(this.declareJestObjGetterIdentifier(), [])
        );
      }
    }
  },

  post({ path: program }) {
    const self = this;
    visitBlock(program);
    program.traverse({
      BlockStatement: visitBlock
    });

    function visitBlock(block) {
      const [varsHoistPoint, callsHoistPoint] = block.unshiftContainer('body', [
        babelTypes.emptyStatement(),
        babelTypes.emptyStatement()
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

        if (
          babelTypes.isIdentifier(callee) &&
          callee.name === self.jestObjGetterIdentifier?.name
        ) {
          const mockStmt = callExpr.getStatementParent();
          if (mockStmt && mockStmt.parentPath.isBlock()) {
            mockStmt.remove();
            callsHoistPoint.insertBefore(mockStmt.node);
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

          varsHoistPoint.insertBefore(
            babelTypes.variableDeclaration(kind, [varDecl.node])
          );
        }
      }
    }
  }
});

exports.default = _default;
