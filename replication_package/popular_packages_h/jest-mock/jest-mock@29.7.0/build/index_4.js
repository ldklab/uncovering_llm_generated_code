'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function getType(value) {
  const objType = Object.prototype.toString.call(value).slice(8, -1);
  switch (objType) {
    case 'Function':
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction':
      return 'function';
    case 'Array':
      return 'array';
    case 'Object':
    case 'Module':
      return 'object';
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Symbol':
      return 'constant';
    case 'Map':
    case 'WeakMap':
    case 'Set':
      return 'collection';
    case 'RegExp':
      return 'regexp';
    case 'Undefined':
      return 'undefined';
    case 'Null':
      return 'null';
    default:
      return null;
  }
}

class ModuleMocker {
  constructor(global) {
    this._environmentGlobal = global;
    this._mockState = new WeakMap();
    this._mockConfigRegistry = new WeakMap();
    this._spyState = new Set();
    this._invocationCallCounter = 1;
  }

  fn(mockImplementation) {
    return this._makeMock({
      length: mockImplementation ? mockImplementation.length : 0,
      type: 'function'
    }, mockImplementation);
  }

  _makeMock(metadata, implementation) {
    const f = this._createMockFunction(metadata, (args) => {
      const callData = {
        contexts: [this],
        calls: [args],
        results: []
      };

      const result = {
        type: 'return',
        value: implementation ? implementation.apply(this, args) : undefined
      };

      callData.results.push(result);
      this._mockState.set(f, callData);

      return result.value;
    });

    return f;
  }

  _createMockFunction(metadata, fn) {
    const mockFunc = function() {
      return mockFunc._mock.apply(this, arguments);
    };
    mockFunc._mock = fn;
    mockFunc._isMockFunction = true;

    return mockFunc;
  }

  spyOn(object, methodKey) {
    if (typeof object[methodKey] !== 'function') {
      throw new Error(`Cannot spy on non-function property '${methodKey}'`);
    }
    
    const originalMethod = object[methodKey];
    const mockMethod = this.fn(function() {
      return originalMethod.apply(this, arguments);
    });

    object[methodKey] = mockMethod;
    return mockMethod;
  }

  replaceProperty(object, propertyKey, value) {
    if (typeof object[propertyKey] === 'function') {
      throw new Error(`Cannot replace property '${propertyKey}' because it's a function`);
    }

    const originalValue = object[propertyKey];
    if (typeof object[propertyKey] === 'undefined') {
      throw new Error(`Property '${propertyKey}' does not exist`);
    }

    object[propertyKey] = value;

    return {
      restore: () => {
        object[propertyKey] = originalValue;
      }
    };
  }
}

exports.ModuleMocker = ModuleMocker;

const JestMock = new ModuleMocker(globalThis);
exports.fn = JestMock.fn.bind(JestMock);
exports.spyOn = JestMock.spyOn.bind(JestMock);
exports.replaceProperty = JestMock.replaceProperty.bind(JestMock);
