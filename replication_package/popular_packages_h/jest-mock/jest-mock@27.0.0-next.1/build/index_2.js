'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

class ModuleMocker {
  constructor(global) {
    this._environmentGlobal = global;
    this._mockState = new WeakMap();
    this._mockConfigRegistry = new WeakMap();
    this._spyState = new Set();
    this._invocationCallCounter = 1;
  }

  static MOCK_CONSTRUCTOR_NAME = 'mockConstructor';
  static RESERVED_KEYWORDS = new Set([
    'arguments', 'await', 'break', 'case', 'catch', 'class', 'const', 
    'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 
    'eval', 'export', 'extends', 'false', 'finally', 'for', 'function', 
    'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 
    'new', 'null', 'package', 'private', 'protected', 'public', 'return', 
    'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 
    'typeof', 'var', 'void', 'while', 'with', 'yield'
  ]);

  _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  _getSlots(object) {
    if (!object) return [];
    const slots = new Set();
    const envPrototypes = [
      this._environmentGlobal.Object.prototype,
      this._environmentGlobal.Function.prototype,
      this._environmentGlobal.RegExp.prototype
    ];
    const nativePrototypes = [
      Object.prototype, 
      Function.prototype, 
      RegExp.prototype
    ];
    
    while (object && !envPrototypes.includes(object) && !nativePrototypes.includes(object)) {
      Object.getOwnPropertyNames(object).forEach(prop => {
        if (!this.isReadonlyProp(object, prop)) {
          const desc = Object.getOwnPropertyDescriptor(object, prop);
          if ((desc && !desc.get) || object.__esModule) {
            slots.add(prop);
          }
        }
      });
      object = Object.getPrototypeOf(object);
    }
    return Array.from(slots);
  }

  isReadonlyProp(object, prop) {
    const readonlyFunctionProps = ['arguments', 'caller', 'callee', 'name', 'length'];
    const readonlyRegExpProps = ['source', 'global', 'ignoreCase', 'multiline'];
    
    if (readonlyFunctionProps.includes(prop)) {
      return ['Function', 'AsyncFunction', 'GeneratorFunction'].includes(this.getObjectType(object));
    }
    if (readonlyRegExpProps.includes(prop)) {
      return this.getObjectType(object) === 'RegExp';
    }
    return false;
  }

  getObjectType(value) {
    return Object.prototype.toString.apply(value).slice(8, -1);
  }

  getType(ref) {
    const typeName = this.getObjectType(ref);
    if (['Function', 'AsyncFunction', 'GeneratorFunction'].includes(typeName)) return 'function';
    if (Array.isArray(ref)) return 'array';
    if (typeName === 'Object') return 'object';
    if (['Number', 'String', 'Boolean', 'Symbol'].includes(typeName)) return 'constant';
    if (['Map', 'WeakMap', 'Set'].includes(typeName)) return 'collection';
    if (typeName === 'RegExp') return 'regexp';
    if (ref === undefined) return 'undefined';
    if (ref === null) return 'null';
    return null;
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
    return state;
  }

  _defaultMockConfig() {
    return { mockImpl: undefined, mockName: 'jest.fn()', specificMockImpls: [], specificReturnValues: [] };
  }

  _defaultMockState() {
    return { calls: [], instances: [], invocationCallOrder: [], results: [] };
  }

  _makeComponent(metadata, restore) {
    if (metadata.type !== 'function') throw new Error(`Unrecognized type ${metadata.type || 'undefined type'}`);
    const prototype = (metadata.members?.prototype?.members) || {};
    const prototypeSlots = this._getSlots(prototype);
    const mocker = this;

    const mockConstructor = function (...args) {
      const mockState = mocker._ensureMockState(f);
      const mockConfig = mocker._ensureMockConfig(f);
      mockState.instances.push(this);
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
            return mockImpl && mockImpl.apply(this, arguments);
          }

          let specificMockImpl = mockConfig.specificMockImpls.shift();
          if (specificMockImpl === undefined) specificMockImpl = mockConfig.mockImpl;

          if (specificMockImpl) return specificMockImpl.apply(this, arguments);

          if (f._protoImpl) return f._protoImpl.apply(this, arguments);

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
    };

    const f = this._createMockFunction(metadata, mockConstructor);

    f._isMockFunction = true;
    f.getMockImplementation = () => this._ensureMockConfig(f).mockImpl;

    if (typeof restore === 'function') this._spyState.add(restore);

    this._mockState.set(f, this._defaultMockState());
    this._mockConfigRegistry.set(f, this._defaultMockConfig());

    Object.defineProperty(f, 'mock', {
      configurable: false,
      enumerable: true,
      get: () => this._ensureMockState(f),
      set: val => this._mockState.set(f, val)
    });

    this._setupMockCapabilities(f, prototypeSlots, restore);

    if (metadata.mockImpl) f.mockImplementation(metadata.mockImpl);

    return f;
  }

  _setupMockCapabilities(f, prototypeSlots, restore) {
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
      return restore ? restore() : undefined;
    };

    f.mockReturnValueOnce = value => f.mockImplementationOnce(() => value);
    f.mockResolvedValueOnce = value => f.mockImplementationOnce(() => Promise.resolve(value));
    f.mockRejectedValueOnce = value => f.mockImplementationOnce(() => Promise.reject(value));
    f.mockReturnValue = value => f.mockImplementation(() => value);
    f.mockResolvedValue = value => f.mockImplementation(() => Promise.resolve(value));
    f.mockRejectedValue = value => f.mockImplementation(() => Promise.reject(value));

    f.mockImplementationOnce = fn => {
      const mockConfig = this._ensureMockConfig(f);
      mockConfig.specificMockImpls.push(fn);
      return f;
    };

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
      } while (name.startsWith(boundFunctionPrefix));
    }

    if (name === ModuleMocker.MOCK_CONSTRUCTOR_NAME) return mockConstructor;

    if (ModuleMocker.RESERVED_KEYWORDS.has(name) || /^\d/.test(name))
      name = '$' + name;

    name = name.replace(/[\s!-\/:-@\[-`{-~]/g, '$');

    const body = `return function ${name}() { return ${ModuleMocker.MOCK_CONSTRUCTOR_NAME}.apply(this,arguments);}${bindCall}`;
    const createConstructor = new this._environmentGlobal.Function(ModuleMocker.MOCK_CONSTRUCTOR_NAME, body);

    return createConstructor(mockConstructor);
  }

  generateFromMetadata(_metadata) {
    const callbacks = [];
    const refs = {};
    const mock = this._generateMock(_metadata, callbacks, refs);
    callbacks.forEach(setter => setter());
    return mock;
  }

  _generateMock(metadata, callbacks, refs) {
    const mock = this._makeComponent(metadata);

    if (metadata.refID != null) {
      refs[metadata.refID] = mock;
    }

    this._getSlots(metadata.members).forEach(slot => {
      const slotMetadata = (metadata.members && metadata.members[slot]) || {};
      if (slotMetadata.ref != null) {
        callbacks.push(() => mock[slot] = refs[slotMetadata.ref]);
      } else {
        mock[slot] = this._generateMock(slotMetadata, callbacks, refs);
      }
    });

    if (metadata.type !== 'undefined' && metadata.type !== 'null' && mock.prototype && typeof mock.prototype === 'object') {
      mock.prototype.constructor = mock;
    }

    return mock;
  }

  getMetadata(component, _refs) {
    const refs = _refs || new Map();
    const ref = refs.get(component);
    if (ref != null) return { ref };

    const type = this.getType(component);
    if (!type) return null;

    const metadata = { type };

    if (['constant', 'collection', 'undefined', 'null'].includes(type)) {
      metadata.value = component;
      return metadata;
    }

    if (type === 'function') {
      metadata.name = component.name;
      if (component._isMockFunction === true) metadata.mockImpl = component.getMockImplementation();
    }

    metadata.refID = refs.size;
    refs.set(component, metadata.refID);

    let members = null;

    if (type !== 'array') {
      this._getSlots(component).forEach(slot => {
        if (type === 'function' && component._isMockFunction === true && slot.match(/^mock/)) return;
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

  fn(implementation) {
    const length = implementation ? implementation.length : 0;
    const fn = this._makeComponent({ length, type: 'function' });
    if (implementation) fn.mockImplementation(implementation);
    return fn;
  }

  spyOn(object, methodName, accessType) {
    if (accessType) return this._spyOnProperty(object, methodName, accessType);
    if (typeof object !== 'object' && typeof object !== 'function') throw new Error(`Cannot spyOn on a primitive value; ${typeof object} given`);
    const original = object[methodName];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') throw new Error(`Cannot spy the ${methodName} property because it is not a function; ${typeof original} given instead`);

      const isMethodOwner = object.hasOwnProperty(methodName);
      let descriptor = Object.getOwnPropertyDescriptor(object, methodName);
      let proto = Object.getPrototypeOf(object);

      while (!descriptor && proto !== null) {
        descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
        proto = Object.getPrototypeOf(proto);
      }

      let mock;

      if (descriptor && descriptor.get) {
        const originalGet = descriptor.get;
        mock = this._makeComponent(
          { type: 'function' },
          () => { descriptor.get = originalGet; Object.defineProperty(object, methodName, descriptor); }
        );

        descriptor.get = () => mock;
        Object.defineProperty(object, methodName, descriptor);
      } else {
        mock = this._makeComponent(
          { type: 'function' },
          () => isMethodOwner ? object[methodName] = original : delete object[methodName]
        );
        object[methodName] = mock;
      }

      mock.mockImplementation(function () {
        return original.apply(this, arguments);
      });
    }

    return object[methodName];
  }

  _spyOnProperty(obj, propertyName, accessType = 'get') {
    if (typeof obj !== 'object' && typeof obj !== 'function') throw new Error(`Cannot spyOn on a primitive value; ${typeof obj} given`);
    if (!obj) throw new Error(`spyOn could not find an object to spy upon for ${propertyName}`);
    if (!propertyName) throw new Error('No property name supplied');

    let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
    let proto = Object.getPrototypeOf(obj);

    while (!descriptor && proto !== null) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
      proto = Object.getPrototypeOf(proto);
    }

    if (!descriptor) throw new Error(`${propertyName} property does not exist`);
    if (!descriptor.configurable) throw new Error(`${propertyName} is not declared configurable`);
    if (!descriptor[accessType]) throw new Error(`Property ${propertyName} does not have access type ${accessType}`);

    const original = descriptor[accessType];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') throw new Error(`Cannot spy the ${propertyName} property because it is not a function; ${typeof original} given instead`);
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

  isMockFunction(fn) {
    return !!fn && fn._isMockFunction === true;
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
}

const JestMock = new ModuleMocker(global);
exports.ModuleMocker = ModuleMocker;
exports.fn = JestMock.fn.bind(JestMock);
exports.spyOn = JestMock.spyOn.bind(JestMock);
