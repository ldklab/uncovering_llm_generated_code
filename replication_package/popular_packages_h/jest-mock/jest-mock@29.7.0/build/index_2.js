'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spyOn =
  exports.replaceProperty =
  exports.mocked =
  exports.fn =
  exports.ModuleMocker =
    void 0;

const { isPromise } = require('jest-util');

const MOCK_CONSTRUCTOR_NAME = 'mockConstructor';
const FUNCTION_NAME_RESERVED_PATTERN = /[\s!-/:-@[-`{-~]/;
const FUNCTION_NAME_RESERVED_REPLACE = new RegExp(FUNCTION_NAME_RESERVED_PATTERN.source, 'g');
const RESERVED_KEYWORDS = new Set([
  'arguments', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 
  'default', 'delete', 'do', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'finally', 
  'for', 'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 
  'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'static', 'super', 
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'
]);

function matchArity(fn, length) {
  let mockConstructor;
  switch (length) {
    case 1: mockConstructor = function (_a) { return fn.apply(this, arguments); }; break;
    case 2: mockConstructor = function (_a, _b) { return fn.apply(this, arguments); }; break;
    case 3: mockConstructor = function (_a, _b, _c) { return fn.apply(this, arguments); }; break;
    case 4: mockConstructor = function (_a, _b, _c, _d) { return fn.apply(this, arguments); }; break;
    case 5: mockConstructor = function (_a, _b, _c, _d, _e) { return fn.apply(this, arguments); }; break;
    case 6: mockConstructor = function (_a, _b, _c, _d, _e, _f) { return fn.apply(this, arguments); }; break;
    case 7: mockConstructor = function (_a, _b, _c, _d, _e, _f, _g) { return fn.apply(this, arguments); }; break;
    case 8: mockConstructor = function (_a, _b, _c, _d, _e, _f, _g, _h) { return fn.apply(this, arguments); }; break;
    case 9: mockConstructor = function (_a, _b, _c, _d, _e, _f, _g, _h, _i) { return fn.apply(this, arguments); }; break;
    default: mockConstructor = function () { return fn.apply(this, arguments); }; break;
  }
  return mockConstructor;
}

function getObjectType(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}

function getType(ref) {
  const typeName = getObjectType(ref);
  if (typeName === 'Function' || typeName === 'AsyncFunction' || 
      typeName === 'GeneratorFunction' || typeName === 'AsyncGeneratorFunction') {
    return 'function';
  } else if (Array.isArray(ref)) {
    return 'array';
  } else if (typeName === 'Object' || typeName === 'Module') {
    return 'object';
  } else if (['Number', 'String', 'Boolean', 'Symbol'].includes(typeName)) {
    return 'constant';
  } else if (['Map', 'WeakMap', 'Set'].includes(typeName)) {
    return 'collection';
  } else if (typeName === 'RegExp') {
    return 'regexp';
  }
  return ref == null ? `${ref}` : typeof ref;
}

function isReadonlyProp(object, prop) {
  if (['arguments', 'caller', 'callee', 'name', 'length'].includes(prop)) {
    const typeName = getObjectType(object);
    return ['Function', 'AsyncFunction', 'GeneratorFunction', 
            'AsyncGeneratorFunction'].includes(typeName);
  }
  if (['source', 'global', 'ignoreCase', 'multiline'].includes(prop)) {
    return getObjectType(object) === 'RegExp';
  }
  return false;
}

class ModuleMocker {
  _environmentGlobal;
  _mockState;
  _mockConfigRegistry;
  _spyState;
  _invocationCallCounter;

  constructor(global) {
    this._environmentGlobal = global;
    this._mockState = new WeakMap();
    this._mockConfigRegistry = new WeakMap();
    this._spyState = new Set();
    this._invocationCallCounter = 1;
  }

  _getSlots(object) {
    if (!object) return [];
    const slots = new Set();
    const ObjectProto = Object.prototype;
    const FunctionProto = Function.prototype;
    const RegExpProto = RegExp.prototype;

    while (object && 
          object !== ObjectProto && 
          object !== FunctionProto && 
          object !== RegExpProto) {
      const ownNames = Object.getOwnPropertyNames(object);
      for (const prop of ownNames) {
        if (!isReadonlyProp(object, prop)) {
          const descriptor = Object.getOwnPropertyDescriptor(object, prop);
          if ((descriptor && !descriptor.get) || object.__esModule) slots.add(prop);
        }
      }
      object = Object.getPrototypeOf(object);
    }
    return [...slots];
  }

  _ensureMockConfig(f) {
    if (!this._mockConfigRegistry.has(f)) {
      this._mockConfigRegistry.set(f, this._defaultMockConfig());
    }
    return this._mockConfigRegistry.get(f);
  }

  _ensureMockState(f) {
    if (!this._mockState.has(f)) {
      this._mockState.set(f, this._defaultMockState());
    }
    const state = this._mockState.get(f);
    if (state.calls.length > 0) state.lastCall = state.calls[state.calls.length - 1];
    return state;
  }

  _defaultMockConfig() {
    return { mockImpl: undefined, mockName: 'jest.fn()', specificMockImpls: [] };
  }

  _defaultMockState() {
    return { calls: [], contexts: [], instances: [], invocationCallOrder: [], results: [] };
  }

  _makeComponent(metadata, restore) {
    const type = metadata.type;
    if (type === 'object') {
      return new this._environmentGlobal.Object();
    } else if (type === 'array') {
      return new this._environmentGlobal.Array();
    } else if (type === 'regexp') {
      return new this._environmentGlobal.RegExp('');
    } else if (['constant', 'collection', 'null', 'undefined'].includes(type)) {
      return metadata.value;
    } else if (type === 'function') {
      const prototype = (metadata.members?.prototype?.members) || {};
      const prototypeSlots = this._getSlots(prototype);
      const mocker = this;
      const mockConstructor = matchArity(function (...args) {
        const mockState = mocker._ensureMockState(f);
        const mockConfig = mocker._ensureMockConfig(f);
        mockState.instances.push(this);
        mockState.contexts.push(this);
        mockState.calls.push(args);
        const mockResult = { type: 'incomplete', value: undefined };
        mockState.results.push(mockResult);
        mockState.invocationCallOrder.push(mocker._invocationCallCounter++);
        let finalReturnValue;
        let thrownError;
        let callDidThrowError = false;
        try {
          finalReturnValue = (() => {
            if (this instanceof f) {
              prototypeSlots.forEach(slot => {
                if (prototype[slot].type === 'function') {
                  const protoImpl = this[slot];
                  this[slot] = mocker.generateFromMetadata(prototype[slot]);
                  this[slot]._protoImpl = protoImpl;
                }
              });
              const mockImpl = mockConfig.specificMockImpls.length
                ? mockConfig.specificMockImpls.shift()
                : mockConfig.mockImpl;
              return mockImpl?.apply(this, arguments);
            }
            let specificMockImpl = mockConfig.specificMockImpls.shift() || mockConfig.mockImpl;
            return specificMockImpl?.apply(this, arguments) || f._protoImpl?.apply(this, arguments);
          })();
        } catch (error) {
          thrownError = error;
          callDidThrowError = true;
          throw error;
        } finally {
          mockResult.type = callDidThrowError ? 'throw' : 'return';
          mockResult.value = callDidThrowError ? thrownError : finalReturnValue;
        }
        return finalReturnValue;
      }, metadata.length || 0);
      const f = this._createMockFunction(metadata, mockConstructor);
      f._isMockFunction = true;
      f.getMockImplementation = () => this._ensureMockConfig(f).mockImpl;
      if (restore) this._spyState.add(restore);
      this._mockState.set(f, this._defaultMockState());
      this._mockConfigRegistry.set(f, this._defaultMockConfig());
      Object.defineProperty(f, 'mock', {
        configurable: false,
        enumerable: true,
        get: () => this._ensureMockState(f),
        set: val => this._mockState.set(f, val)
      });
      f.mockClear = () => {
        this._mockState.delete(f);
        return f;
      };
      f.mockReset = () => {
        f.mockClear();
        this._mockConfigRegistry.delete(f);
        return f;
      };
      f.mockRestore = () => {
        f.mockReset();
        return restore?.();
      };
      f.mockReturnValueOnce = value => f.mockImplementationOnce(() => value);
      f.mockResolvedValueOnce = value => f.mockImplementationOnce(() => this._environmentGlobal.Promise.resolve(value));
      f.mockRejectedValueOnce = value => f.mockImplementationOnce(() => this._environmentGlobal.Promise.reject(value));
      f.mockReturnValue = value => f.mockImplementation(() => value);
      f.mockResolvedValue = value => f.mockImplementation(() => this._environmentGlobal.Promise.resolve(value));
      f.mockRejectedValue = value => f.mockImplementation(() => this._environmentGlobal.Promise.reject(value));
      f.mockImplementationOnce = fn => {
        this._ensureMockConfig(f).specificMockImpls.push(fn);
        return f;
      };
      f.withImplementation = function(fn, callback) {
        const mockConfig = mocker._ensureMockConfig(f);
        const prevImpl = mockConfig.mockImpl;
        const prevSpecificImpls = mockConfig.specificMockImpls;
        mockConfig.mockImpl = fn;
        mockConfig.specificMockImpls = [];
        const result = callback();
        const restoreFn = () => {
          mockConfig.mockImpl = prevImpl;
          mockConfig.specificMockImpls = prevSpecificImpls;
        };
        return isPromise(result) ? result.finally(restoreFn) : restoreFn();
      };
      f.mockImplementation = fn => {
        this._ensureMockConfig(f).mockImpl = fn;
        return f;
      };
      f.mockReturnThis = () => f.mockImplementation(function () { return this; });
      f.mockName = name => {
        if (name) this._ensureMockConfig(f).mockName = name;
        return f;
      };
      f.getMockName = () => this._ensureMockConfig(f).mockName || 'jest.fn()';
      if (metadata.mockImpl) f.mockImplementation(metadata.mockImpl);
      return f;
    } else {
      throw new Error(`Unrecognized type ${metadata.type || 'undefined type'}`);
    }
  }

  _createMockFunction(metadata, mockConstructor) {
    let name = metadata.name;
    if (!name) return mockConstructor;

    const boundFunctionPrefix = 'bound ';
    let bindCall = '';
    while (name.startsWith(boundFunctionPrefix)) {
      name = name.substring(boundFunctionPrefix.length);
      bindCall = '.bind(null)';
    }

    if (name === MOCK_CONSTRUCTOR_NAME ||
        RESERVED_KEYWORDS.has(name) ||
        /^\d/.test(name)) {
      name = `$${name}`;
    }

    if (FUNCTION_NAME_RESERVED_PATTERN.test(name)) {
      name = name.replace(FUNCTION_NAME_RESERVED_REPLACE, '$');
    }

    const body = `return function ${name}() { return ${MOCK_CONSTRUCTOR_NAME}.apply(this,arguments); }${bindCall}`;
    const createConstructor = new this._environmentGlobal.Function(MOCK_CONSTRUCTOR_NAME, body);
    return createConstructor(mockConstructor);
  }

  _generateMock(metadata, callbacks, refs) {
    const mock = this._makeComponent(metadata);
    if (metadata.refID != null) refs[metadata.refID] = mock;
    for (const slot of this._getSlots(metadata.members || {})) {
      const slotMetadata = metadata.members[slot] || {};
      if (slotMetadata.ref != null) {
        callbacks.push((ref => () => (mock[slot] = refs[ref]))(slotMetadata.ref));
      } else {
        mock[slot] = this._generateMock(slotMetadata, callbacks, refs);
      }
    }
    if (metadata.type !== 'undefined' && metadata.type !== 'null' && mock.prototype && typeof mock.prototype === 'object') {
      mock.prototype.constructor = mock;
    }
    return mock;
  }

  _findReplacedProperty(object, propertyKey) {
    for (const spyState of this._spyState) {
      if (spyState.object === object && spyState.property === propertyKey) {
        return spyState;
      }
    }
    return;
  }

  generateFromMetadata(metadata) {
    const callbacks = [];
    const refs = {};
    const mock = this._generateMock(metadata, callbacks, refs);
    callbacks.forEach(setter => setter());
    return mock;
  }

  getMetadata(component, _refs = new Map()) {
    const ref = _refs.get(component);
    if (ref != null) return { ref };

    const type = getType(component);
    if (!type) return null;

    const metadata = { type };

    if (['constant', 'collection', 'undefined', 'null'].includes(type)) {
      metadata.value = component;
      return metadata;
    } else if (type === 'function') {
      const componentName = component.name;
      if (typeof componentName === 'string') {
        metadata.name = componentName;
      }
      if (this.isMockFunction(component)) {
        metadata.mockImpl = component.getMockImplementation();
      }
    }

    metadata.refID = _refs.size;
    _refs.set(component, metadata.refID);

    let members = null;
    if (type !== 'array') {
      this._getSlots(component).forEach(slot => {
        if (type === 'function' && this.isMockFunction(component) && slot.match(/^mock/)) return;

        const slotMetadata = this.getMetadata(component[slot], _refs);
        if (slotMetadata) {
          if (!members) members = {};
          members[slot] = slotMetadata;
        }
      });
    }

    if (members) metadata.members = members;

    return metadata;
  }

  isMockFunction(fn) {
    return fn != null && fn._isMockFunction === true;
  }

  fn(implementation) {
    const length = implementation ? implementation.length : 0;
    const mockFn = this._makeComponent({ length, type: 'function' });
    if (implementation) mockFn.mockImplementation(implementation);
    return mockFn;
  }

  spyOn(object, methodKey, accessType) {
    if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
      throw new Error(`Cannot use spyOn on a primitive value; ${this._typeOf(object)} given`);
    }
    if (!methodKey) {
      throw new Error('No property name supplied');
    }
    if (accessType) {
      return this._spyOnProperty(object, methodKey, accessType);
    }
    const original = object[methodKey];
    if (!original) {
      throw new Error(`Property \`${String(methodKey)}\` does not exist`);
    }
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(`Cannot spy on \`${String(methodKey)}\` because it is not a function; ${this._typeOf(original)} given`);
      }
      const isMethodOwner = Object.prototype.hasOwnProperty.call(object, methodKey);
      let descriptor = Object.getOwnPropertyDescriptor(object, methodKey);
      let proto = Object.getPrototypeOf(object);
      while (!descriptor && proto) {
        descriptor = Object.getOwnPropertyDescriptor(proto, methodKey);
        proto = Object.getPrototypeOf(proto);
      }
      let mock;
      if (descriptor?.get) {
        const originalGet = descriptor.get;
        mock = this._makeComponent({ type: 'function' }, () => {
          descriptor.get = originalGet;
          Object.defineProperty(object, methodKey, descriptor);
        });
        descriptor.get = () => mock;
        Object.defineProperty(object, methodKey, descriptor);
      } else {
        mock = this._makeComponent({ type: 'function' }, () => {
          if (isMethodOwner) {
            object[methodKey] = original;
          } else {
            delete object[methodKey];
          }
        });
        object[methodKey] = mock;
      }
      mock.mockImplementation(function () {
        return original.apply(this, arguments);
      });
    }
    return object[methodKey];
  }

  _spyOnProperty(object, propertyKey, accessType) {
    let descriptor = Object.getOwnPropertyDescriptor(object, propertyKey);
    let proto = Object.getPrototypeOf(object);
    while (!descriptor && proto) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyKey);
      proto = Object.getPrototypeOf(proto);
    }
    if (!descriptor) {
      throw new Error(`Property \`${String(propertyKey)}\` does not exist`);
    }
    if (!descriptor.configurable) {
      throw new Error(`Property \`${String(propertyKey)}\` is not configurable`);
    }
    if (!descriptor[accessType]) {
      throw new Error(`Property \`${String(propertyKey)}\` does not have access type ${accessType}`);
    }
    const original = descriptor[accessType];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(`Cannot spy on \`${String(propertyKey)}\` because it is not a function; ${this._typeOf(original)} given`);
      }
      descriptor[accessType] = this._makeComponent({ type: 'function' }, () => {
        descriptor[accessType] = original;
        Object.defineProperty(object, propertyKey, descriptor);
      });
      descriptor[accessType].mockImplementation(function () {
        return original.apply(this, arguments);
      });
    }
    Object.defineProperty(object, propertyKey, descriptor);
    return descriptor[accessType];
  }

  replaceProperty(object, propertyKey, value) {
    if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
      throw new Error(`Cannot use replaceProperty on a primitive value; ${this._typeOf(object)} given`);
    }
    if (!propertyKey) {
      throw new Error('No property name supplied');
    }
    let descriptor = Object.getOwnPropertyDescriptor(object, propertyKey);
    let proto = Object.getPrototypeOf(object);
    while (!descriptor && proto) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyKey);
      proto = Object.getPrototypeOf(proto);
    }
    if (!descriptor) {
      throw new Error(`Property \`${String(propertyKey)}\` does not exist`);
    }
    if (!descriptor.configurable) {
      throw new Error(`Property \`${String(propertyKey)}\` is not configurable`);
    }
    if (descriptor.get || descriptor.set) {
      throw new Error(`Cannot replace \`${String(propertyKey)}\`; use jest.spyOn instead`);
    }
    const existingRestore = this._findReplacedProperty(object, propertyKey);
    if (existingRestore) {
      return existingRestore.replaced.replaceValue(value);
    }
    const isPropertyOwner = Object.prototype.hasOwnProperty.call(object, propertyKey);
    const originalValue = descriptor.value;
    const restore = () => { 
      isPropertyOwner ? object[propertyKey] = originalValue : delete object[propertyKey]; 
    };
    const replaced = {
      replaceValue: value => { object[propertyKey] = value; return replaced; },
      restore: () => { restore(); this._spyState.delete(restore); }
    };
    restore.object = object;
    restore.property = propertyKey;
    restore.replaced = replaced;
    this._spyState.add(restore);
    return replaced.replaceValue(value);
  }

  clearAllMocks() {
    this._mockState = new WeakMap();
  }

  resetAllMocks() {
    this._mockConfigRegistry = new WeakMap();
    this._mockState = new WeakMap();
  }

  restoreAllMocks() {
    this._spyState.forEach(restore => restore());
    this._spyState = new Set();
  }

  _typeOf(value) {
    return value == null ? `${value}` : typeof value;
  }

  mocked(source) {
    return source;
  }
}

exports.ModuleMocker = ModuleMocker;

const JestMock = new ModuleMocker(globalThis);
const fn = JestMock.fn.bind(JestMock);
exports.fn = fn;
const spyOn = JestMock.spyOn.bind(JestMock);
exports.spyOn = spyOn;
const mocked = JestMock.mocked.bind(JestMock);
exports.mocked = mocked;
const replaceProperty = JestMock.replaceProperty.bind(JestMock);
exports.replaceProperty = replaceProperty;
