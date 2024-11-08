'use strict';

const MOCK_CONSTRUCTOR_NAME = 'mockConstructor';
const FUNCTION_NAME_RESERVED_PATTERN = /[\s!-\/:-@\[-`{-~]/;
const functionPattern = new RegExp(FUNCTION_NAME_RESERVED_PATTERN.source, 'g');
const RESERVED_KEYWORDS = new Set(['arguments', 'await', 'break', ...'yield']);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function matchArity(fn, length) {
  const constructors = [
    (...args) => fn.apply(this, args),  // handles default and >9 length
    (a) => fn.apply(this, arguments),
    (a, b) => fn.apply(this, arguments),
    // ...same for 3 to 9 params, appearing here
  ];
  return constructors[length] || constructors[0];
}

function getObjectType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

function getType(ref) {
  switch (getObjectType(ref)) {
    case 'Function':
    case 'AsyncFunction':
    case 'GeneratorFunction':
      return 'function';
    case 'Array':
      return 'array';
    case 'Object':
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

function isReadonlyProp(object, prop) {
  const typeName = getObjectType(object);
  if (['arguments', 'caller', 'callee', 'name', 'length'].includes(prop)) {
    return ['Function', 'AsyncFunction', 'GeneratorFunction'].includes(typeName);
  }
  if (['source', 'global', 'ignoreCase', 'multiline'].includes(prop)) {
    return typeName === 'RegExp';
  }
  return false;
}

class ModuleMocker {
  constructor(global) {
    _defineProperty(this, '_environmentGlobal', global);
    _defineProperty(this, '_mockState', new WeakMap());
    _defineProperty(this, '_mockConfigRegistry', new WeakMap());
    _defineProperty(this, '_spyState', new Set());
    _defineProperty(this, '_invocationCallCounter', 1);
  }

  _getSlots(object) {
    if (!object) return [];
    const slots = new Set();
    const envProtos = [this._environmentGlobal.Object.prototype, this._environmentGlobal.Function.prototype, this._environmentGlobal.RegExp.prototype, Object.prototype, Function.prototype, RegExp.prototype];
    while (object !== null && !envProtos.includes(object)) {
      Object.getOwnPropertyNames(object).forEach(prop => {
        if (!isReadonlyProp(object, prop)) {
          const propDesc = Object.getOwnPropertyDescriptor(object, prop);
          if ((propDesc && !propDesc.get) || object.__esModule) {
            slots.add(prop);
          }
        }
      });
      object = Object.getPrototypeOf(object);
    }
    return Array.from(slots);
  }

  _ensureMockConfig(f) {
    if (!this._mockConfigRegistry.has(f)) {
      this._mockConfigRegistry.set(f, {
        mockImpl: undefined,
        mockName: 'jest.fn()',
        specificMockImpls: [],
        specificReturnValues: []
      });
    }
    return this._mockConfigRegistry.get(f);
  }

  _ensureMockState(f) {
    if (!this._mockState.has(f)) {
      this._mockState.set(f, {
        calls: [],
        instances: [],
        invocationCallOrder: [],
        results: []
      });
    }
    return this._mockState.get(f);
  }

  _makeComponent(metadata, restore) {
    if (metadata.type === 'object') return new this._environmentGlobal.Object();
    if (metadata.type === 'array') return new this._environmentGlobal.Array();
    if (metadata.type === 'regexp') return new this._environmentGlobal.RegExp('');
    if (metadata.type === 'constant' || metadata.type === 'collection' || metadata.type === 'null' || metadata.type === 'undefined') return metadata.value;
    if (metadata.type !== 'function') throw new Error(`Unrecognized type ${metadata.type || 'undefined type'}`);

    const mockConstructor = matchArity(function(...args) {
      const state = this._ensureMockState(f);
      const config = this._ensureMockConfig(f);
      const result = { type: 'incomplete', value: undefined };
      state.instances.push(this);
      state.calls.push(args);
      state.results.push(result);
      state.invocationCallOrder.push(this._invocationCallCounter++);
      let returnValue, thrownError, callDidThrowError = false;
      try {
        returnValue = (() => {
          if (this instanceof f) {
            this._getSlots(prototype || {}).forEach(slot => {
              if (prototype[slot].type === 'function') this[slot] = this.generateFromMetadata(prototype[slot]);
            });
            const impl = config.specificMockImpls.length ? config.specificMockImpls.shift() : config.mockImpl;
            return impl ? impl.apply(this, args) : undefined;
          }
          const impl = config.specificMockImpls.shift() || config.mockImpl || f._protoImpl;
          return impl ? impl.apply(this, args) : undefined;
        })();
      } catch (error) {
        thrownError = error;
        callDidThrowError = true;
        throw error;
      } finally {
        result.type = callDidThrowError ? 'throw' : 'return';
        result.value = callDidThrowError ? thrownError : returnValue;
      }
      return returnValue;
    }, metadata.length || 0);

    const f = this._createMockFunction(metadata, mockConstructor);
    f._isMockFunction = true;
    f.getMockImplementation = () => this._ensureMockConfig(f).mockImpl;

    if (typeof restore === 'function') {
      this._spyState.add(restore);
    }

    this._mockState.set(f, { calls: [], instances: [], invocationCallOrder: [], results: [] });
    this._mockConfigRegistry.set(f, { mockImpl: undefined, mockName: 'jest.fn()', specificMockImpls: [], specificReturnValues: [] });

    Object.defineProperty(f, 'mock', {
      configurable: false,
      enumerable: true,
      get: () => this._ensureMockState(f),
      set: val => this._mockState.set(f, val)
    });

    // Define methods on the mock object
    Object.assign(f, {
      mockClear: () => {
        this._mockState.delete(f);
        return f;
      },
      mockReset: () => {
        f.mockClear();
        this._mockConfigRegistry.delete(f);
        return f;
      },
      mockRestore: () => {
        f.mockReset();
        return restore ? restore() : undefined;
      },
      mockReturnValueOnce: value => f.mockImplementationOnce(() => value),
      mockResolvedValueOnce: value => f.mockImplementationOnce(() => Promise.resolve(value)),
      mockRejectedValueOnce: value => f.mockImplementationOnce(() => Promise.reject(value)),
      mockReturnValue: value => f.mockImplementation(() => value),
      mockResolvedValue: value => f.mockImplementation(() => Promise.resolve(value)),
      mockRejectedValue: value => f.mockImplementation(() => Promise.reject(value)),
      mockImplementationOnce: fn => {
        this._ensureMockConfig(f).specificMockImpls.push(fn);
        return f;
      },
      mockImplementation: fn => {
        this._ensureMockConfig(f).mockImpl = fn;
        return f;
      },
      mockReturnThis: () => f.mockImplementation(function() { return this; }),
      mockName: name => {
        if (name) this._ensureMockConfig(f).mockName = name;
        return f;
      },
      getMockName: () => this._ensureMockConfig(f).mockName || 'jest.fn()'
    });

    if (metadata.mockImpl) f.mockImplementation(metadata.mockImpl);

    return f;
  }

  _createMockFunction(metadata, mockConstructor) {
    let name = metadata.name;

    if (!name) return mockConstructor;

    const boundFunctionPrefix = 'bound ';
    let bindCall = '';

    if (name.startsWith(boundFunctionPrefix)) {
      do {
        name = name.slice(boundFunctionPrefix.length);
        bindCall = '.bind(null)';
      } while (name.startsWith(boundFunctionPrefix));
    }

    if (name === MOCK_CONSTRUCTOR_NAME || RESERVED_KEYWORDS.has(name) || /^\d/.test(name) || FUNCTION_NAME_RESERVED_PATTERN.test(name)) {
      name = `$${name}`.replace(functionPattern, '$');
    }

    const body = `return function ${name}() { return ${MOCK_CONSTRUCTOR_NAME}.apply(this,arguments); }${bindCall}`;
    return new this._environmentGlobal.Function(MOCK_CONSTRUCTOR_NAME, body)(mockConstructor);
  }

  generateFromMetadata(_metadata) {
    const callbacks = [];
    const refs = {};
    const mock = this._generateMock(_metadata, callbacks, refs);
    callbacks.forEach(setter => setter());
    return mock;
  }

  getMetadata(component, _refs = new Map()) {
    if (_refs.has(component)) return { ref: _refs.get(component) };
    const type = getType(component);
    if (!type) return null;

    const metadata = { type };
    if (['constant', 'collection', 'undefined', 'null'].includes(type)) {
      metadata.value = component;
      return metadata;
    }
    if (type === 'function') {
      metadata.name = component.name;
      if (component._isMockFunction) metadata.mockImpl = component.getMockImplementation();
    }

    metadata.refID = _refs.size;
    _refs.set(component, metadata.refID);

    let members;
    if (type !== 'array') {
      this._getSlots(component).forEach(slot => {
        if (!(type === 'function' && component._isMockFunction && slot.startsWith('mock'))) {
          const slotMetadata = this.getMetadata(component[slot], _refs);
          if (slotMetadata) (members ||= {})[slot] = slotMetadata;
        }
      });
    }

    if (members) metadata.members = members;
    return metadata;
  }

  isMockFunction(fn) {
    return !!fn && fn._isMockFunction;
  }

  fn(implementation) {
    const fn = this._makeComponent({ length: implementation ? implementation.length : 0, type: 'function' });
    if (implementation) fn.mockImplementation(implementation);
    return fn;
  }

  spyOn(object, methodName, accessType) {
    if (accessType) return this._spyOnProperty(object, methodName, accessType);

    if (typeof object !== 'object' && typeof object !== 'function') 
      throw new Error(`Cannot spyOn on a primitive value; ${this._typeOf(object)} given`);

    const original = object[methodName];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') 
        throw new Error(`Cannot spy the ${methodName} property because it is not a function; ${this._typeOf(original)} given instead`);

      const isMethodOwner = object.hasOwnProperty(methodName);
      let descriptor = Object.getOwnPropertyDescriptor(object, methodName);
      let proto = Object.getPrototypeOf(object);

      while (!descriptor && proto) {
        descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
        proto = Object.getPrototypeOf(proto);
      }

      let mock;
      if (descriptor && descriptor.get) {
        const originalGet = descriptor.get;
        mock = this._makeComponent({ type: 'function' }, () => {
          descriptor.get = originalGet;
          Object.defineProperty(object, methodName, descriptor);
        });
        descriptor.get = () => mock;
        Object.defineProperty(object, methodName, descriptor);
      } else {
        mock = this._makeComponent({ type: 'function' }, () => {
          isMethodOwner ? object[methodName] = original : delete object[methodName];
        });
        object[methodName] = mock;
      }

      mock.mockImplementation(function() {
        return original.apply(this, arguments);
      });
    }
    return object[methodName];
  }

  _spyOnProperty(obj, propertyName, accessType = 'get') {
    if (typeof obj !== 'object' && typeof obj !== 'function') 
      throw new Error(`Cannot spyOn on a primitive value; ${this._typeOf(obj)} given`);

    if (!obj) 
      throw new Error(`spyOn could not find an object to spy upon for ${propertyName}`);
      
    if (!propertyName) 
      throw new Error('No property name supplied');

    let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
    let proto = Object.getPrototypeOf(obj);

    while (!descriptor && proto) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
      proto = Object.getPrototypeOf(proto);
    }

    if (!descriptor) throw new Error(`${propertyName} property does not exist`);
    if (!descriptor.configurable) throw new Error(`${propertyName} is not declared configurable`);
    if (!descriptor[accessType]) throw new Error(`Property ${propertyName} does not have access type ${accessType}`);

    const original = descriptor[accessType];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') 
        throw new Error(`Cannot spy the ${propertyName} property because it is not a function; ${this._typeOf(original)} given instead`);

      descriptor[accessType] = this._makeComponent({ type: 'function' }, () => {
        descriptor[accessType] = original;
        Object.defineProperty(obj, propertyName, descriptor);
      });
      descriptor[accessType].mockImplementation(function () {
        return original.apply(this, arguments);
      });
    }
    Object.defineProperty(obj, propertyName, descriptor);
    return descriptor[accessType];
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
    return value === null ? 'null' : typeof value;
  }
}

const globalMock = new ModuleMocker(global);
export const fn = globalMock.fn;
export const spyOn = globalMock.spyOn;
