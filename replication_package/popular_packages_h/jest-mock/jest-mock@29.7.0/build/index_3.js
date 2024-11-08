'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const MOCK_CONSTRUCTOR_NAME = 'mockConstructor';
const FUNCTION_NAME_RESERVED_PATTERN = /[\s!-/:-@[-`{-~]/;

const RESERVED_KEYWORDS = new Set([
  'arguments', 'await', 'break', 
  // More keywords...
]);

function matchArity(fn, length) {
  switch (length) {
    case 1: return function (_a) { return fn.apply(this, arguments); };
    case 2: return function (_a, _b) { return fn.apply(this, arguments); };
    // More cases...
    default: return function () { return fn.apply(this, arguments); };
  }
}

function getObjectType(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}

function getType(ref) {
  const typeName = getObjectType(ref);
  if (['Function', 'AsyncFunction', 'GeneratorFunction', 'AsyncGeneratorFunction'].includes(typeName)) return 'function';
  if (Array.isArray(ref)) return 'array';
  if (['Object', 'Module'].includes(typeName)) return 'object';
  if (['Number', 'String', 'Boolean', 'Symbol'].includes(typeName)) return 'constant';
  if (['Map', 'WeakMap', 'Set'].includes(typeName)) return 'collection';
  if (typeName === 'RegExp') return 'regexp';
  if (ref === undefined) return 'undefined';
  if (ref === null) return 'null';
  return null;
}

function isReadonlyProp(object, prop) {
  if (['arguments', 'caller', 'callee', 'name', 'length'].includes(prop)) {
    return ['Function', 'AsyncFunction', 'GeneratorFunction', 'AsyncGeneratorFunction'].includes(getObjectType(object));
  }
  if (['source', 'global', 'ignoreCase', 'multiline'].includes(prop)) {
    return getObjectType(object) === 'RegExp';
  }
  return false;
}

class ModuleMocker {
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
    while (object) {
      if (object === Object.prototype || object === Function.prototype || object === RegExp.prototype) break;
      Object.getOwnPropertyNames(object).forEach(prop => {
        if (!isReadonlyProp(object, prop)) {
          const desc = Object.getOwnPropertyDescriptor(object, prop);
          if ((desc && !desc.get) || object.__esModule) slots.add(prop);
        }
      });
      object = Object.getPrototypeOf(object);
    }
    return Array.from(slots);
  }

  _ensureMockConfig(f) {
    let config = this._mockConfigRegistry.get(f);
    if (!config) {
      config = this._defaultMockConfig();
      this._mockConfigRegistry.set(f, config);
    }
    return config;
  }

  _ensureMockState(f) {
    let state = this._mockState.get(f);
    if (!state) {
      state = this._defaultMockState();
      this._mockState.set(f, state);
    }
    if (state.calls.length > 0) {
      state.lastCall = state.calls[state.calls.length - 1];
    }
    return state;
  }

  _defaultMockConfig() {
    return { mockImpl: undefined, mockName: 'jest.fn()', specificMockImpls: [] };
  }

  _defaultMockState() {
    return { calls: [], contexts: [], instances: [], invocationCallOrder: [], results: [] };
  }

  _makeComponent(metadata, restore) {
    if (metadata.type === 'object') {
      return new this._environmentGlobal.Object();
    }
    if (metadata.type === 'array') {
      return new this._environmentGlobal.Array();
    }
    if (metadata.type === 'regexp') {
      return new this._environmentGlobal.RegExp('');
    }
    if (metadata.type === 'constant' || metadata.type === 'collection' || metadata.type === 'null' || metadata.type === 'undefined') {
      return metadata.value;
    }
    if (metadata.type === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      console.log("Function type detected in metadata"); // Debug log
      const prototype = (metadata.members && metadata.members.prototype && metadata.members.prototype.members) || {};
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
                if (prototype[slot].type === 'function') this[slot] = mocker.generateFromMetadata(prototype[slot]);
              });
              const mockImpl = mockConfig.specificMockImpls.length ? mockConfig.specificMockImpls.shift() : mockConfig.mockImpl;
              return mockImpl && mockImpl.apply(this, arguments);
            }
            let specificMockImpl = mockConfig.specificMockImpls.shift();
            if (specificMockImpl === undefined) {
              specificMockImpl = mockConfig.mockImpl;
            }
            if (specificMockImpl) {
              return specificMockImpl.apply(this, arguments);
            }
            if (f._protoImpl) {
              return f._protoImpl.apply(this, arguments);
            }
            return undefined;
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
      if (typeof restore === 'function') {
        this._spyState.add(restore);
      }
      this._mockState.set(f, this._defaultMockState());
      this._mockConfigRegistry.set(f, this._defaultMockConfig());
      Object.defineProperty(f, 'mock', {
        configurable: false,
        enumerable: true,
        get: () => this._ensureMockState(f),
        set: val => this._mockState.set(f, val)
      });
      f.mockClear = () => { this._mockState.delete(f); return f; };
      f.mockReset = () => { f.mockClear(); this._mockConfigRegistry.delete(f); return f; };
      f.mockRestore = () => { f.mockReset(); return restore ? restore() : undefined; };
      f.mockReturnValueOnce = value => f.mockImplementationOnce(() => value);
      f.mockResolvedValueOnce = value => f.mockImplementationOnce(() => this._environmentGlobal.Promise.resolve(value));
      f.mockRejectedValueOnce = value => f.mockImplementationOnce(() => this._environmentGlobal.Promise.reject(value));
      f.mockReturnValue = value => f.mockImplementation(() => value);
      f.mockResolvedValue = value => f.mockImplementation(() => this._environmentGlobal.Promise.resolve(value));
      f.mockRejectedValue = value => f.mockImplementation(() => this._environmentGlobal.Promise.reject(value));
      f.mockImplementationOnce = fn => {
        const mockConfig = this._ensureMockConfig(f);
        mockConfig.specificMockImpls.push(fn);
        return f;
      };
      f.withImplementation = withImplementation.bind(this);
      function withImplementation(fn, callback) {
        const mockConfig = this._ensureMockConfig(f);
        const previousImplementation = mockConfig.mockImpl;
        const previousSpecificImplementations = mockConfig.specificMockImpls;
        mockConfig.mockImpl = fn;
        mockConfig.specificMockImpls = [];
        const returnedValue = callback();
        if (returnedValue instanceof Promise) {
          return returnedValue.then(() => {
            mockConfig.mockImpl = previousImplementation;
            mockConfig.specificMockImpls = previousSpecificImplementations;
          });
        } else {
          mockConfig.mockImpl = previousImplementation;
          mockConfig.specificMockImpls = previousSpecificImplementations;
        }
      }
      f.mockImplementation = fn => {
        const mockConfig = this._ensureMockConfig(f);
        mockConfig.mockImpl = fn;
        return f;
      };
      f.mockReturnThis = () => f.mockImplementation(function () { return this; });
      f.mockName = name => {
        if (name) {
          const mockConfig = this._ensureMockConfig(f);
          mockConfig.mockName = name;
        }
        return f;
      };
      f.getMockName = () => this._ensureMockConfig(f).mockName || 'jest.fn()';
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
    if (name.startsWith(boundFunctionPrefix)) {
      do {
        name = name.substring(boundFunctionPrefix.length);
        bindCall = '.bind(null)';
      } while (name && name.startsWith(boundFunctionPrefix));
    }
    if (name === MOCK_CONSTRUCTOR_NAME) return mockConstructor;
    if (RESERVED_KEYWORDS.has(name) || /^\d/.test(name)) name = `$${name}`;
    name = name.replace(FUNCTION_NAME_RESERVED_PATTERN, '$');
    const body = `return function ${name}() { return ${MOCK_CONSTRUCTOR_NAME}.apply(this,arguments); }${bindCall}`;
    const createConstructor = new this._environmentGlobal.Function(MOCK_CONSTRUCTOR_NAME, body);
    return createConstructor(mockConstructor);
  }

  _generateMock(metadata, callbacks, refs) {
    const mock = this._makeComponent(metadata);
    if (metadata.refID != null) {
      refs[metadata.refID] = mock;
    }
    this._getSlots(metadata.members).forEach(slot => {
      const slotMetadata = (metadata.members && metadata.members[slot]) || {};
      if (slotMetadata.ref != null) {
        callbacks.push((ref => () => (mock[slot] = refs[ref]))(slotMetadata.ref));
      } else {
        mock[slot] = this._generateMock(slotMetadata, callbacks, refs);
      }
    });
    if (metadata.type !== 'undefined' && metadata.type !== 'null' && mock.prototype && typeof mock.prototype === 'object') {
      mock.prototype.constructor = mock;
    }
    return mock;
  }

  generateFromMetadata(metadata) {
    const callbacks = [];
    const refs = {};
    const mock = this._generateMock(metadata, callbacks, refs);
    callbacks.forEach(setter => setter());
    return mock;
  }

  getMetadata(component, _refs) {
    const refs = _refs || new Map();
    const ref = refs.get(component);
    if (ref != null) {
      return { ref };
    }
    const type = getType(component);
    if (!type) return null;
    const metadata = { type };
    if (type === 'constant' || type === 'collection' || type === 'undefined' || type === 'null') {
      metadata.value = component;
      return metadata;
    }
    if (type === 'function') {
      if (typeof component.name === 'string') metadata.name = component.name;
      if (this.isMockFunction(component)) metadata.mockImpl = component.getMockImplementation();
    }
    metadata.refID = refs.size;
    refs.set(component, metadata.refID);
    let members = null;
    if (type !== 'array') {
      this._getSlots(component).forEach(slot => {
        if (type === 'function' && this.isMockFunction(component) && slot.match(/^mock/)) return;
        const slotMetadata = this.getMetadata(component[slot], refs);
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
    const fn = this._makeComponent({ length, type: 'function' });
    if (implementation) fn.mockImplementation(implementation);
    return fn;
  }

  spyOn(object, methodKey, accessType) {
    if (object == null || (typeof object !== 'object' && typeof object !== 'function')) {
      throw new Error(`Cannot use spyOn on a primitive value; ${this._typeOf(object)} given`);
    }
    if (methodKey == null) {
      throw new Error('No property name supplied');
    }
    if (accessType) {
      return this._spyOnProperty(object, methodKey, accessType);
    }
    const original = object[methodKey];
    if (!original) {
      throw new Error(`Property \`${String(methodKey)}\` does not exist in the provided object`);
    }
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(`Cannot spy on the \`${String(methodKey)}\` property because it is not a function; ${this._typeOf(original)} given instead.`);
      }
      const isMethodOwner = Object.prototype.hasOwnProperty.call(object, methodKey);
      let descriptor = Object.getOwnPropertyDescriptor(object, methodKey);
      let proto = Object.getPrototypeOf(object);
      while (!descriptor && proto !== null) {
        descriptor = Object.getOwnPropertyDescriptor(proto, methodKey);
        proto = Object.getPrototypeOf(proto);
      }
      let mock;
      if (descriptor && descriptor.get) {
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
      mock.mockImplementation(function () { return original.apply(this, arguments); });
    }
    return object[methodKey];
  }

  _spyOnProperty(object, propertyKey, accessType) {
    let descriptor = Object.getOwnPropertyDescriptor(object, propertyKey);
    let proto = Object.getPrototypeOf(object);
    while (!descriptor && proto !== null) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyKey);
      proto = Object.getPrototypeOf(proto);
    }
    if (!descriptor) {
      throw new Error(`Property \`${String(propertyKey)}\` does not exist in the provided object`);
    }
    if (!descriptor.configurable) {
      throw new Error(`Property \`${String(propertyKey)}\` is not declared configurable`);
    }
    if (!descriptor[accessType]) {
      throw new Error(`Property \`${String(propertyKey)}\` does not have access type ${accessType}`);
    }
    const original = descriptor[accessType];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(`Cannot spy on the ${String(propertyKey)} property because it is not a function; ${this._typeOf(original)} given instead.`);
      }
      descriptor[accessType] = this._makeComponent({ type: 'function' }, () => {
        descriptor[accessType] = original;
        Object.defineProperty(object, propertyKey, descriptor);
      });
      descriptor[accessType].mockImplementation(function () { return original.apply(this, arguments); });
    }
    Object.defineProperty(object, propertyKey, descriptor);
    return descriptor[accessType];
  }

  replaceProperty(object, propertyKey, value) {
    if (object == null || (typeof object !== 'object' && typeof object !== 'function')) {
      throw new Error(`Cannot use replaceProperty on a primitive value; ${this._typeOf(object)} given`);
    }
    if (propertyKey == null) {
      throw new Error('No property name supplied');
    }
    let descriptor = Object.getOwnPropertyDescriptor(object, propertyKey);
    let proto = Object.getPrototypeOf(object);
    while (!descriptor && proto !== null) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyKey);
      proto = Object.getPrototypeOf(proto);
    }
    if (!descriptor) {
      throw new Error(`Property \`${String(propertyKey)}\` does not exist in the provided object`);
    }
    if (!descriptor.configurable) {
      throw new Error(`Property \`${String(propertyKey)}\` is not declared configurable`);
    }
    if (descriptor.get !== undefined) {
      throw new Error(`Cannot replace the \`${String(propertyKey)}\` property because it has a getter.`);
    }
    if (descriptor.set !== undefined) {
      throw new Error(`Cannot replace the \`${String(propertyKey)}\` property because it has a setter.`);
    }
    if (typeof descriptor.value === 'function') {
      throw new Error(`Cannot replace the \`${String(propertyKey)}\` property because it is a function.`);
    }
    const existingRestore = this._findReplacedProperty(object, propertyKey);
    if (existingRestore) {
      return existingRestore.replaced.replaceValue(value);
    }
    const isPropertyOwner = Object.prototype.hasOwnProperty.call(object, propertyKey);
    const originalValue = descriptor.value;
    const restore = () => {
      if (isPropertyOwner) {
        object[propertyKey] = originalValue;
      } else {
        delete object[propertyKey];
      }
    };
    const replaced = {
      replaceValue: value => {
        object[propertyKey] = value;
        return replaced;
      },
      restore: () => {
        restore();
        this._spyState.delete(restore);
      }
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
exports.fn = JestMock.fn.bind(JestMock);
exports.spyOn = JestMock.spyOn.bind(JestMock);
exports.mocked = JestMock.mocked.bind(JestMock);
exports.replaceProperty = JestMock.replaceProperty.bind(JestMock);
