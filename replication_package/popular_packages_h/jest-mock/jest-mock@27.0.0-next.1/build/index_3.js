'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.spyOn = exports.fn = exports.ModuleMocker = void 0;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

const MOCK_CONSTRUCTOR_NAME = 'mockConstructor';
const FUNCTION_NAME_RESERVED_PATTERN = /[\s!-\/:-@\[-`{-~]/;
const FUNCTION_NAME_RESERVED_REPLACE = new RegExp(
  FUNCTION_NAME_RESERVED_PATTERN.source,
  'g'
);

const RESERVED_KEYWORDS = new Set([
  'arguments', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'enum', 'eval', 'export', 
  'extends', 'false', 'finally', 'for', 'function', 'if', 'implements', 
  'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null', 'package', 
  'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 
  'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 
  'yield'
]);

function matchArity(fn, length) {
  switch (length) {
    case 1: return function (_a) { return fn.apply(this, arguments); };
    case 2: return function (_a, _b) { return fn.apply(this, arguments); };
    case 3: return function (_a, _b, _c) { return fn.apply(this, arguments); };
    case 4: return function (_a, _b, _c, _d) { return fn.apply(this, arguments); };
    case 5: return function (_a, _b, _c, _d, _e) { return fn.apply(this, arguments); };
    case 6: return function (_a, _b, _c, _d, _e, _f) { return fn.apply(this, arguments); };
    case 7: return function (_a, _b, _c, _d, _e, _f, _g) { return fn.apply(this, arguments); };
    case 8: return function (_a, _b, _c, _d, _e, _f, _g, _h) { return fn.apply(this, arguments); };
    case 9: return function (_a, _b, _c, _d, _e, _f, _g, _h, _i) { return fn.apply(this, arguments); };
    default: return function () { return fn.apply(this, arguments); };
  }
}

function getObjectType(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}

function getType(ref) {
  const typeName = getObjectType(ref);
  if (typeName === 'Function' || typeName === 'AsyncFunction' || typeName === 'GeneratorFunction') {
    return 'function';
  } else if (Array.isArray(ref)) {
    return 'array';
  } else if (typeName === 'Object') {
    return 'object';
  } else if (typeName === 'Number' || typeName === 'String' || typeName === 'Boolean' || typeName === 'Symbol') {
    return 'constant';
  } else if (typeName === 'Map' || typeName === 'WeakMap' || typeName === 'Set') {
    return 'collection';
  } else if (typeName === 'RegExp') {
    return 'regexp';
  } else if (ref === undefined) {
    return 'undefined';
  } else if (ref === null) {
    return 'null';
  } else {
    return null;
  }
}

function isReadonlyProp(object, prop) {
  if (prop === 'arguments' || prop === 'caller' || prop === 'callee' || prop === 'name' || prop === 'length') {
    const typeName = getObjectType(object);
    return typeName === 'Function' || typeName === 'AsyncFunction' || typeName === 'GeneratorFunction';
  }
  if (prop === 'source' || prop === 'global' || prop === 'ignoreCase' || prop === 'multiline') {
    return getObjectType(object) === 'RegExp';
  }
  return false;
}

class ModuleMocker {
  constructor(global) {
    _defineProperty(this, '_environmentGlobal', void 0);
    _defineProperty(this, '_mockState', void 0);
    _defineProperty(this, '_mockConfigRegistry', void 0);
    _defineProperty(this, '_spyState', void 0);
    _defineProperty(this, '_invocationCallCounter', void 0);

    this._environmentGlobal = global;
    this._mockState = new WeakMap();
    this._mockConfigRegistry = new WeakMap();
    this._spyState = new Set();
    this._invocationCallCounter = 1;
  }

  _getSlots(object) {
    if (!object) {
      return [];
    }
    const slots = new Set();
    const EnvObjectProto = this._environmentGlobal.Object.prototype;
    const EnvFunctionProto = this._environmentGlobal.Function.prototype;
    const EnvRegExpProto = this._environmentGlobal.RegExp.prototype;
    const ObjectProto = Object.prototype;
    const FunctionProto = Function.prototype;
    const RegExpProto = RegExp.prototype;

    while (
      object != null &&
      object !== EnvObjectProto &&
      object !== EnvFunctionProto &&
      object !== EnvRegExpProto &&
      object !== ObjectProto &&
      object !== FunctionProto &&
      object !== RegExpProto
    ) {
      const ownNames = Object.getOwnPropertyNames(object);
      for (let i = 0; i < ownNames.length; i++) {
        const prop = ownNames[i];
        if (!isReadonlyProp(object, prop)) {
          const propDesc = Object.getOwnPropertyDescriptor(object, prop);
          if ((propDesc !== undefined && !propDesc.get) || object.__esModule) {
            slots.add(prop);
          }
        }
      }
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
    return state;
  }

  _defaultMockConfig() {
    return {
      mockImpl: undefined,
      mockName: 'jest.fn()',
      specificMockImpls: [],
      specificReturnValues: []
    };
  }

  _defaultMockState() {
    return {
      calls: [],
      instances: [],
      invocationCallOrder: [],
      results: []
    };
  }

  _makeComponent(metadata, restore) {
    if (metadata.type === 'object') {
      return new this._environmentGlobal.Object();
    } else if (metadata.type === 'array') {
      return new this._environmentGlobal.Array();
    } else if (metadata.type === 'regexp') {
      return new this._environmentGlobal.RegExp('');
    } else if (
      metadata.type === 'constant' ||
      metadata.type === 'collection' ||
      metadata.type === 'null' ||
      metadata.type === 'undefined'
    ) {
      return metadata.value;
    } else if (metadata.type === 'function') {
      const prototype =
        (metadata.members &&
          metadata.members.prototype &&
          metadata.members.prototype.members) ||
        {};

      const prototypeSlots = this._getSlots(prototype);
      const mocker = this;
      const mockConstructor = matchArity(function (...args) {
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
      f.getMockImplementation = () => this._ensureMockConfig(f).mockImpl;

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

      f.mockReturnValueOnce = (value) => f.mockImplementationOnce(() => value);
      f.mockResolvedValueOnce = value => f.mockImplementationOnce(() => Promise.resolve(value));
      f.mockRejectedValueOnce = value => f.mockImplementationOnce(() => Promise.reject(value));
      f.mockReturnValue = (value) => f.mockImplementation(() => value);
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

      f.mockReturnThis = () =>
        f.mockImplementation(function () {
          return this;
        });

      f.mockName = name => {
        if (name) {
          const mockConfig = this._ensureMockConfig(f);
          mockConfig.mockName = name;
        }
        return f;
      };

      f.getMockName = () => {
        const mockConfig = this._ensureMockConfig(f);
        return mockConfig.mockName || 'jest.fn()';
      };

      if (metadata.mockImpl) {
        f.mockImplementation(metadata.mockImpl);
      }

      return f;
    } else {
      const unknownType = metadata.type || 'undefined type';
      throw new Error('Unrecognized type ' + unknownType);
    }
  }

  _createMockFunction(metadata, mockConstructor) {
    let name = metadata.name;
    if (!name) {
      return mockConstructor;
    }

    const boundFunctionPrefix = 'bound ';
    let bindCall = '';
    if (name && name.startsWith(boundFunctionPrefix)) {
      do {
        name = name.substring(boundFunctionPrefix.length);
        bindCall = '.bind(null)';
      } while (name && name.startsWith(boundFunctionPrefix));
    }

    if (name === MOCK_CONSTRUCTOR_NAME) {
      return mockConstructor;
    }

    if (RESERVED_KEYWORDS.has(name) || /^\d/.test(name)) {
      name = '$' + name;
    }
    if (FUNCTION_NAME_RESERVED_PATTERN.test(name)) {
      name = name.replace(FUNCTION_NAME_RESERVED_REPLACE, '$');
    }

    const body =
      'return function ' +
      name +
      '() {' +
      'return ' +
      MOCK_CONSTRUCTOR_NAME +
      '.apply(this,arguments);' +
      '}' +
      bindCall;
    const createConstructor = new this._environmentGlobal.Function(
      MOCK_CONSTRUCTOR_NAME,
      body
    );
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
        callbacks.push(
          (function (ref) {
            return () => (mock[slot] = refs[ref]);
          })(slotMetadata.ref)
        );
      } else {
        mock[slot] = this._generateMock(slotMetadata, callbacks, refs);
      }
    });

    if (
      metadata.type !== 'undefined' &&
      metadata.type !== 'null' &&
      mock.prototype &&
      typeof mock.prototype === 'object'
    ) {
      mock.prototype.constructor = mock;
    }

    return mock;
  }

  generateFromMetadata(_metadata) {
    const callbacks = [];
    const refs = {};
    const mock = this._generateMock(_metadata, callbacks, refs);
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
    if (!type) {
      return null;
    }

    const metadata = { type };
    if (type === 'constant' || type === 'collection' || type === 'undefined' || type === 'null') {
      metadata.value = component;
      return metadata;
    } else if (type === 'function') {
      metadata.name = component.name;

      if (component._isMockFunction === true) {
        metadata.mockImpl = component.getMockImplementation();
      }
    }

    metadata.refID = refs.size;
    refs.set(component, metadata.refID);
    let members = null;
    if (type !== 'array') {
      this._getSlots(component).forEach(slot => {
        if (
          type === 'function' &&
          component._isMockFunction === true &&
          slot.match(/^mock/)
        ) {
          return;
        }

        const slotMetadata = this.getMetadata(component[slot], refs);
        if (slotMetadata) {
          if (!members) {
            members = {};
          }
          members[slot] = slotMetadata;
        }
      });
    }

    if (members) {
      metadata.members = members;
    }

    return metadata;
  }

  isMockFunction(fn) {
    return !!fn && fn._isMockFunction === true;
  }

  fn(implementation) {
    const length = implementation ? implementation.length : 0;
    const fn = this._makeComponent({ length, type: 'function' });
    if (implementation) {
      fn.mockImplementation(implementation);
    }
    return fn;
  }

  spyOn(object, methodName, accessType) {
    if (accessType) {
      return this._spyOnProperty(object, methodName, accessType);
    }

    if (typeof object !== 'object' && typeof object !== 'function') {
      throw new Error(
        'Cannot spyOn on a primitive value; ' + this._typeOf(object) + ' given'
      );
    }

    const original = object[methodName];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(
          'Cannot spy the ' +
            methodName +
            ' property because it is not a function; ' +
            this._typeOf(original) +
            ' given instead'
        );
      }

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
          () => {
            descriptor.get = originalGet;
            Object.defineProperty(object, methodName, descriptor);
          }
        );

        descriptor.get = () => mock;
        Object.defineProperty(object, methodName, descriptor);
      } else {
        mock = this._makeComponent(
          { type: 'function' },
          () => {
            if (isMethodOwner) {
              object[methodName] = original;
            } else {
              delete object[methodName];
            }
          }
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
    if (typeof obj !== 'object' && typeof obj !== 'function') {
      throw new Error(
        'Cannot spyOn on a primitive value; ' + this._typeOf(obj) + ' given'
      );
    }

    if (!obj) {
      throw new Error('spyOn could not find an object to spy upon for ' + propertyName + '');
    }

    if (!propertyName) {
      throw new Error('No property name supplied');
    }

    let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
    let proto = Object.getPrototypeOf(obj);

    while (!descriptor && proto !== null) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
      proto = Object.getPrototypeOf(proto);
    }

    if (!descriptor) {
      throw new Error(propertyName + ' property does not exist');
    }

    if (!descriptor.configurable) {
      throw new Error(propertyName + ' is not declared configurable');
    }

    if (!descriptor[accessType]) {
      throw new Error(
        'Property ' + propertyName + ' does not have access type ' + accessType
      );
    }

    const original = descriptor[accessType];
    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(
          'Cannot spy the ' +
            propertyName +
            ' property because it is not a function; ' +
            this._typeOf(original) +
            ' given instead'
        );
      }

      descriptor[accessType] = this._makeComponent(
        { type: 'function' },
        () => {
          descriptor[accessType] = original;
          Object.defineProperty(obj, propertyName, descriptor);
        }
      );

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
    return value == null ? '' + value : typeof value;
  }
}

exports.ModuleMocker = ModuleMocker;
const JestMock = new ModuleMocker(global);
const fn = JestMock.fn;
exports.fn = fn;
const spyOn = JestMock.spyOn;
exports.spyOn = spyOn;
