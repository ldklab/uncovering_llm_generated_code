class ModuleMocker {
  constructor(global) {
    this.global = global;
    this._mockFunctionCallOrder = 1;
    this._mockInstances = new Map();
  }

  generateFromMetadata(metadata) {
    if (metadata.type !== 'function') return () => {};

    const mock = this._createMockFunction();
    if (metadata.members) {
      for (const memberName in metadata.members) {
        if (memberName === 'prototype') {
          mock.prototype = this._generateMockPrototype(metadata.members.prototype);
        } else {
          mock[memberName] = this.generateFromMetadata(metadata.members[memberName]);
        }
      }
    }

    return mock;
  }

  getMetadata(component) {
    return Array.isArray(component) ? { type: 'array' }
           : typeof component === 'function' ? { type: 'function' }
           : typeof component === 'object' ? { type: 'object', members: {} }
           : { type: 'ref' };
  }

  _createMockFunction(implementation = () => {}) {
    const mockFn = (...args) => {
      mockFn.mock.calls.push(args);
      mockFn.mock.instances.push(this);
      mockFn.mock.invocationCallOrder.push(this._mockFunctionCallOrder++);
      const returnValues = mockFn._mockReturnValueQueue;
      const returnVal = returnValues.length ? returnValues.shift() : mockFn._defaultReturnValue;
      return returnVal === undefined ? mockFn._defaultImplementation(...args) : returnVal;
    };

    mockFn.mock = { calls: [], instances: [], invocationCallOrder: [] };
    mockFn._defaultImplementation = implementation;
    mockFn._defaultReturnValue = undefined;
    mockFn._mockReturnValueQueue = [];
    mockFn._mockImplementationQueue = [];

    this._attachMockControls(mockFn);
    
    return mockFn;
  }

  _attachMockControls(mockFn) {
    mockFn.mockReturnValueOnce = (value) => {
      mockFn._mockReturnValueQueue.push(value);
      return mockFn;
    };

    mockFn.mockReturnValue = (value) => {
      mockFn._defaultReturnValue = value;
      return mockFn;
    };

    mockFn.mockImplementationOnce = (fn) => {
      mockFn._mockImplementationQueue.push(fn);
      return mockFn;
    };

    mockFn.mockImplementation = (fn) => {
      mockFn._defaultImplementation = fn;
      return mockFn;
    };

    mockFn.mockReturnThis = () => {
      return mockFn.mockImplementation(function() { return this; });
    };

    mockFn.withImplementation = (fn, callback) => {
      const original = mockFn._defaultImplementation;
      mockFn.mockImplementation(fn);
      const result = callback();
      if (result && typeof result.then === 'function') {
        return result.finally(() => mockFn.mockImplementation(original));
      }
      mockFn.mockImplementation(original);
      return result;
    };
  }

  _generateMockPrototype(protoMetadata) {
    const protoMock = {};
    if (protoMetadata.members) {
      for (const member in protoMetadata.members) {
        protoMock[member] = this.generateFromMetadata(protoMetadata.members[member]);
      }
    }
    return protoMock;
  }
}

export { ModuleMocker };
