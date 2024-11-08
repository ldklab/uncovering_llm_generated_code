'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.ModuleMocker = class {
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
    const iterProto = (proto) => {
      while (proto) {
        Object.getOwnPropertyNames(proto).forEach((prop) => {
          if (!isReadonlyProp(proto, prop) && (proto.__esModule || !Object.getOwnPropertyDescriptor(proto, prop)?.get)) {
            slots.add(prop);
          }
        });
        proto = Object.getPrototypeOf(proto);
      }
    };
    iterProto(object);
    return Array.from(slots);
  }

  _ensureMockConfig(f) {
    return this._ensure(f, this._mockConfigRegistry, this._defaultMockConfig);
  }

  _ensureMockState(f) {
    return this._ensure(f, this._mockState, this._defaultMockState);
  }

  _ensure(f, registry, defaultFn) {
    if (!registry.has(f)) registry.set(f, defaultFn());
    const state = registry.get(f);
    if (state.calls.length > 0) state.lastCall = state.calls[state.calls.length - 1];
    return state;
  }

  _defaultMockConfig() {
    return { mockImpl: undefined, mockName: 'jest.fn()', specificMockImpls: [] };
  }

  _defaultMockState() {
    return { calls: [], contexts: [], instances: [], invocationCallOrder: [], results: [] };
  }

  _makeComponent(metadata) {
    const componentType = {
      'object': () => new this._environmentGlobal.Object(),
      'array': () => new this._environmentGlobal.Array(),
      'regexp': () => new this._environmentGlobal.RegExp(''),
      'constant': () => metadata.value,
      'collection': () => metadata.value,
      'null': () => metadata.value,
      'undefined': () => metadata.value,
      'function': () => this._createMockFunction(metadata, matchArity((...args) => {
        const mockState = this._ensureMockState(f);
        const mockConfig = this._ensureMockConfig(f);
        mockState.instances.push(this);
        mockState.contexts.push(this);
        mockState.calls.push(args);
        const mockResult = { type: 'incomplete', value: undefined };
        mockState.results.push(mockResult);
        mockState.invocationCallOrder.push(this._invocationCallCounter++);

        let finalReturnValue;
        let thrownError;
        let callDidThrowError = false;
        try {
          finalReturnValue = this._executeMock(fn, mockConfig, args, this);
        } catch (error) {
          thrownError = error;
          callDidThrowError = true;
          throw error;
        } finally {
          mockResult.type = callDidThrowError ? 'throw' : 'return';
          mockResult.value = callDidThrowError ? thrownError : finalReturnValue;
        }
        return finalReturnValue;
      }, metadata.length || 0))
    };

    if (!componentType[metadata.type]) throw new Error(`Unrecognized type ${metadata.type}`);

    const f = componentType[metadata.type](metadata);
    f._isMockFunction = true;
    f.getMockImplementation = () => this._ensureMockConfig(f).mockImpl;
    this._initializeMockAttributes(f);
    const prototypeSlots = this._getSlots(metadata.members?.prototype?.members || {});

    f.mockImplementationOnce = this._generateMockFunctionOnce(f, metadata, prototypeSlots);
    f.mockImplementation = fn => {
      this._ensureMockConfig(f).mockImpl = fn;
      return f;
    };
    f.mockReturnValue = value => f.mockImplementation(() => value);
    f.mockReturnThis = () => f.mockImplementation(function () { return this; });
    if (metadata.mockImpl) f.mockImplementation(metadata.mockImpl);

    return f;
  }

  _initializeMockAttributes(f) {
    const bind = (fn) => this._spyState.add(fn);
    const mockClear = f.mockClear = () => { this._mockState.delete(f); return f; };
    const mockReset = f.mockReset = () => { mockClear(); this._mockConfigRegistry.delete(f); return f; };
    const mockRestore = f.mockRestore = () => { mockReset(); bind(); };
    
    Object.defineProperty(f, 'mock', { enumerable: true, get: () => this._ensureMockState(f), set: val => this._mockState.set(f, val) });
    return f;
  }

  _generateMockFunctionOnce(f, metadata, prototypeSlots) {
    return (fn) => {
      const mockConfig = this._ensureMockConfig(f);
      mockConfig.specificMockImpls.push(fn);
      return f;
    };
  }

  _executeMock(fn, mockConfig, args, context) {
    if (this instanceof fn) {
      mockConfig.specificMockImpls.forEach(slot => {
        if (prototype[slot]?.type === 'function') this[slot] = this.generateFromMetadata(prototype[slot]);
      });
      const mockImpl = mockConfig.specificMockImpls.length ? mockConfig.specificMockImpls.shift() : mockConfig.mockImpl;
      return mockImpl?.apply(context, args);
    }

    const impl = mockConfig.specificMockImpls.shift() || mockConfig.mockImpl;
    if (impl) return impl.apply(context, args);
    if (fn._protoImpl) return fn._protoImpl.apply(context, args);
    return undefined;
  }

  _createMockFunction(metadata, mockConstructor) {
    let { name } = metadata;
    if (!name) return mockConstructor;
  
    const rename = (string, checker) => {
      while (name?.startsWith(string)) {
        name = name.substring(string.length);
        checker();
      }
    };

    rename('bound ', () => bindCall = '.bind(null)');
    
    const isReservedOrInvalid = (n) => RESERVED_KEYWORDS.has(n) || /^\d/.test(n) || FUNCTION_NAME_RESERVED_PATTERN.test(n);
    if (name === MOCK_CONSTRUCTOR_NAME || isReservedOrInvalid(name)) {
      name = `$${name}`.replace(FUNCTION_NAME_RESERVED_REPLACE, '$');
    }

    const body = `return function ${name}() { return ${MOCK_CONSTRUCTOR_NAME}.apply(this,arguments); }${bindCall}`;
    return new this._environmentGlobal.Function(MOCK_CONSTRUCTOR_NAME, body)(mockConstructor);
  }

  spyOn(object, methodKey, accessType) {
    if (!object) throw new Error(`Cannot use spyOn on a primitive value; ${this._typeOf(object)} given`);
    
    const original = object[methodKey];
    if (!original) throw new Error(`Property \`${String(methodKey)}\` does not exist in the provided object`);
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') this._throwErrorOnNonFunction(methodKey, original);
      return this._createSpy(object, methodKey, original, accessType);
    }
    return object[methodKey];
  }

  _throwErrorOnNonFunction(methodKey, original) {
    throw new Error(`Cannot spy on the \`${String(methodKey)}\` property because it is not a function; ${this._typeOf(original)} given instead.`);
  }

  _createSpy(object, methodKey, original, accessType) {
    const descriptor = this._findDescriptor(object, methodKey);

    const mock = accessType ? this._makeComponent({ type: 'function' }) : this._generateSpy(mockImplementation);
    descriptor[accessType] = mock;
    if (accessType) Object.defineProperty(object, methodKey, descriptor);
    mock.mockImplementation(function () { return original.apply(this, arguments); });
    return mock;
  }

  _findDescriptor(object, methodKey) {
    let descriptor = Object.getOwnPropertyDescriptor(object, methodKey);
    let proto = Object.getPrototypeOf(object);

    while (!descriptor && proto != null) {
      descriptor = Object.getOwnPropertyDescriptor(proto, methodKey);
      proto = Object.getPrototypeOf(proto);
    }
    if (!descriptor || !descriptor.configurable) this._throwErrorOnInaccessibleProperty(methodKey);
    return descriptor;
  }

  _throwErrorOnInaccessibleProperty(methodKey) {
    throw new Error(`Property \`${String(methodKey)}\` is not declared configurable`);
  }

  replaceProperty(object, propertyKey, value) {
    if (!object) throw new Error(`Cannot use replaceProperty on a primitive value; ${this._typeOf(object)} given`);
    const descriptor = this._findDescriptor(object, propertyKey);

    if (this._isFunction(descriptor, propertyKey)) this._throwErrorOnFunctionReplacement(propertyKey);
    
    if (!descriptor.value) this._replaceWithGetterSetter(object, propertyKey, descriptor, value);
    else {
      const replaceFn = this._replaceValue(object, propertyKey, descriptor, value);
      this._spyState.add(replaceFn);
      return { restore: replaceFn };
    }
  }

  _replaceValue(object, propertyKey, descriptor, value) {
    const originalValue = descriptor.value;
    const isOwned = Object.prototype.hasOwnProperty.call(object, propertyKey);
    const restore = () => isOwned ? (object[propertyKey] = originalValue) : delete object[propertyKey];
    object[propertyKey] = value;
    
    return () => {
      restore();
      this._spyState.delete(restore);
    };
  }

  _isFunction(descriptor, propertyKey) {
    if (typeof descriptor.value === 'function') {
      throw new Error(`Cannot replace the \`${String(propertyKey)}\` property because it is a function. Use \`jest.spyOn(object, '${String(propertyKey)}')\` instead.`);
    }
  }

  _replaceWithGetterSetter(object, propertyKey, descriptor, value) {
    if (descriptor.get) this._throwErrorOnGetter(propertyKey);
    if (descriptor.set) this._throwErrorOnSetter(propertyKey);
    Object.defineProperty(object, propertyKey, { value, configurable: true });
  }

  _throwErrorOnGetter(propertyKey) {
    throw new Error(`Cannot replace the \`${String(propertyKey)}\` property because it has a getter. Use \`jest.spyOn(object, '${String(propertyKey)}', 'get').mockReturnValue(value)\` instead.`);
  }

  _throwErrorOnSetter(propertyKey) {
    throw new Error(`Cannot replace the \`${String(propertyKey)}\` property because it has a setter. Use \`jest.spyOn(object, '${String(propertyKey)}', 'set').mockReturnValue(value)\` instead.`);
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
    this._spyState.clear();
  }

  _typeOf(value) {
    return value == null ? `${value}` : typeof value;
  }

  mocked(source) {
    return source;
  }

  _generateSpy(mockImplementation) {
    const { type: 'function' } = mockImplementation;
    return this._makeComponent({ type }, mockImplementation);
  }

  isMockFunction(fn) {
    return fn?._isMockFunction === true;
  }

  fn(implementation) {
    const mockFn = this._makeComponent({
      length: implementation?.length || 0,
      type: 'function'
    });
    if (implementation) mockFn.mockImplementation(implementation);
    return mockFn;
  }
};

const JestMock = new exports.ModuleMocker(globalThis);
exports.fn = JestMock.fn.bind(JestMock);
exports.spyOn = JestMock.spyOn.bind(JestMock);
exports.mocked = JestMock.mocked.bind(JestMock);
exports.replaceProperty = JestMock.replaceProperty.bind(JestMock);
