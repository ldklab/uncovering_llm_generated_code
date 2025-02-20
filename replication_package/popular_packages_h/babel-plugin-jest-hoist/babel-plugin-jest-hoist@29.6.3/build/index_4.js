'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = jestHoist;

function _template() {
  const data = require('@babel/template');
  return data;
}

function _types() {
  const data = require('@babel/types');
  return data;
}

const JEST_GLOBALS = {
  NAME: 'jest',
  MODULE_NAME: '@jest/globals',
  MODULE_JEST_EXPORT_NAME: 'jest'
};

const hoistedSets = {
  variables: new WeakSet(),
  jestGetters: new WeakSet(),
  jestExpressions: new WeakSet()
};

const ALLOWED_IDENTIFIERS = new Set(
  [
    'Array', 'ArrayBuffer', 'Boolean', 'BigInt', 'DataView', 'Date', 'Error',
    'EvalError', 'Float32Array', 'Float64Array', 'Function', 'Generator',
    'GeneratorFunction', 'Infinity', 'Int16Array', 'Int32Array', 'Int8Array',
    'InternalError', 'Intl', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object',
    'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp',
    'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'URIError', 
    'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'WeakMap',
    'WeakSet', 'arguments', 'console', 'expect', 'isNaN', 'jest', 'parseFloat',
    'parseInt', 'exports', 'require', 'module', '__filename', '__dirname',
    'undefined', ...Object.getOwnPropertyNames(globalThis)
  ].sort()
);

const IDVisitorConfig = {
  ReferencedIdentifier(path, { ids }) {
    ids.add(path);
  },
  blacklist: ['TypeAnnotation', 'TSTypeAnnotation', 'TSTypeQuery', 'TSTypeReference']
};

const jestFunctions = {
  mock: args => {
    if (args.length === 1) return args[0].isStringLiteral() || args[0].isLiteral();
    if (args.length === 2 || args.length === 3) {
      const moduleFactory = args[1];
      if (!moduleFactory.isFunction()) 
        throw moduleFactory.buildCodeFrameError('The second argument of `jest.mock` must be an inline function.\n', TypeError);

      const ids = new Set();
      const parentScope = moduleFactory.parentPath.scope;
      moduleFactory.traverse(IDVisitorConfig, { ids });

      for (const id of ids) {
        const { name } = id.node;
        if (!isIdAllowed(name, id.scope, parentScope)) {
          throw id.buildCodeFrameError(
            'The module factory of `jest.mock()` cannot reference out-of-scope variables.\n' +
            `Invalid variable access: ${name}\n` +
            `Allowed objects: ${Array.from(ALLOWED_IDENTIFIERS).join(', ')}.\n` +
            'Prefix variables with `mock` for lazily required mocks.\n', ReferenceError);
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

function isIdAllowed(name, scope, parentScope) {
  let found = false;
  while (scope !== parentScope) {
    if (scope.bindings[name] != null) {
      found = true;
      break;
    }
    scope = scope.parent;
  }
  if (!found) {
    if ((scope.hasGlobal(name) && ALLOWED_IDENTIFIERS.has(name)) || /^mock/i.test(name) || /^(?:__)?cov/.test(name)) {
      return true;
    }
    const binding = scope.bindings[name];
    const node = binding?.path.node;
    if (binding?.path.isVariableDeclarator() && binding.constant && scope.isPure(node.init, true)) {
      hoistedSets.variables.add(node);
      return true;
    } else if (binding?.path.isImportSpecifier() && binding.path.parentPath.node.source.value === JEST_GLOBALS.MODULE_NAME &&
      ((0, _types().isIdentifier)(binding.path.node.imported) ? binding.path.node.imported.name : binding.path.node.imported.value) === JEST_GLOBALS.MODULE_JEST_EXPORT_NAME) {
      return true;
    }
  }
  return false;
}

const createJestObjectGetter = (0, _template().statement)`
function GETTER_NAME() {
  const { JEST_GLOBALS_MODULE_JEST_EXPORT_NAME } = require("JEST_GLOBALS_MODULE_NAME");
  GETTER_NAME = () => JEST_GLOBALS_MODULE_JEST_EXPORT_NAME;
  return JEST_GLOBALS_MODULE_JEST_EXPORT_NAME;
}
`;

const jestHoist = () => ({
  pre({ path: program }) {
    this.declareJestObjGetterIdentifier = () => {
      if (!this.jestObjGetterIdentifier) {
        this.jestObjGetterIdentifier = program.scope.generateUidIdentifier('getJestObj');
        program.unshiftContainer('body', [
          createJestObjectGetter({
            GETTER_NAME: this.jestObjGetterIdentifier.name,
            JEST_GLOBALS_MODULE_JEST_EXPORT_NAME: JEST_GLOBALS.MODULE_JEST_EXPORT_NAME,
            JEST_GLOBALS_MODULE_NAME: JEST_GLOBALS.MODULE_NAME
          })
        ]);
      }
      return this.jestObjGetterIdentifier;
    };
  },
  visitor: {
    ExpressionStatement(exprStmt) {
      const jestObjInfo = extractJestObjExprIfHoistable(exprStmt.get('expression'));
      if (jestObjInfo) {
        const jestCallExpr = (0, _types().callExpression)(this.declareJestObjGetterIdentifier(), []);
        jestObjInfo.path.replaceWith(jestCallExpr);
        if (jestObjInfo.hoist) {
          hoistedSets.jestGetters.add(jestCallExpr);
        }
      }
    }
  },
  post({ path: program }) {
    const visitBlock = block => {
      const [varsHoistPoint, callsHoistPoint] = block.unshiftContainer('body', [(0, _types().emptyStatement)(), (0, _types().emptyStatement)()]);
      block.traverse({ CallExpression: visitCallExpr, VariableDeclarator: visitVariableDecl, blacklist: ['BlockStatement'] });
      callsHoistPoint.remove();
      varsHoistPoint.remove();
    };

    const visitCallExpr = callExpr => {
      if (hoistedSets.jestGetters.has(callExpr.node)) {
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
    };

    const visitVariableDecl = varDecl => {
      if (hoistedSets.variables.has(varDecl.node)) {
        varDecl.parentPath.assertVariableDeclaration();
        const { kind, declarations } = varDecl.parent;
        if (declarations.length === 1) {
          varDecl.parentPath.remove();
        } else {
          varDecl.remove();
        }
        varsHoistPoint.insertBefore((0, _types().variableDeclaration)(kind, [varDecl.node]));
      }
    };

    visitBlock(program);
    program.traverse({ BlockStatement: visitBlock });
  }
});

function extractJestObjExprIfHoistable(expr) {
  if (!expr.isCallExpression()) return null;
  const callee = expr.get('callee');
  const args = expr.get('arguments');
  if (!callee.isMemberExpression() || callee.node.computed) return null;

  const object = callee.get('object');
  const property = callee.get('property');
  const propertyName = property.node.name;
  const jestObjExpr = isJestObject(object) ? object : extractJestObjExprIfHoistable(object)?.path;
  if (!jestObjExpr) return null;

  const functionIsHoistable = jestFunctions[propertyName]?.(args) ?? false;
  let functionHasHoistableScope = functionIsHoistable;
  for (let path = expr; path && !functionHasHoistableScope; path = path.parentPath)
    functionHasHoistableScope = hoistedSets.jestExpressions.has(path.node);

  if (functionHasHoistableScope) {
    hoistedSets.jestExpressions.add(expr.node);
    return { hoist: functionIsHoistable, path: jestObjExpr };
  }
  return null;
}

function isJestObject(expression) {
  return (
    (expression.isIdentifier() && expression.node.name === JEST_GLOBALS.NAME && !expression.scope.hasBinding(JEST_GLOBALS.NAME)) ||
    expression.referencesImport(JEST_GLOBALS.MODULE_NAME, JEST_GLOBALS.MODULE_JEST_EXPORT_NAME) ||
    (expression.isMemberExpression() && !expression.node.computed &&
      expression.get('object').referencesImport(JEST_GLOBALS.MODULE_NAME, '*') &&
      expression.node.property.type === 'Identifier' &&
      expression.node.property.name === JEST_GLOBALS.MODULE_JEST_EXPORT_NAME)
  );
}
