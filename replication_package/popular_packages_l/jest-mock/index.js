class ModuleMocker {
  constructor(global) {
    this.global = global;
    this._mockFunctionCallOrder = 1;
    this._mockInstances = new Map();
  }

  generateFromMetadata(metadata) {
    if (metadata.type !== 'function') {
      return () => {};
    }

    const mock = this.fn();
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
    if (Array.isArray(component)) {
      return {type: 'array'};
    }
    if (typeof component === 'function') {
      return {type: 'function'};
    }
    if (typeof component === 'object') {
      return {type: 'object', members: {}};
    }
    return {type: 'ref'};
  }

  fn(implementation = () => {}) {
    const mockFn = (...args) => {
      mockFn.mock.calls.push(args);
      mockFn.mock.instances.push(this);
      mockFn.mock.invocationCallOrder.push(this._mockFunctionCallOrder++);
      const returnVal = this._mockReturnValueQueue.length
        ? this._mockReturnValueQueue.shift()
        : this._defaultReturnValue;
      return returnVal === undefined ? mockFn._defaultImplementation(...args) : returnVal;
    };
    
    mockFn.mock = {
      calls: [],
      instances: [],
      invocationCallOrder: [],
    };
    mockFn._defaultImplementation = implementation;
    mockFn._defaultReturnValue = undefined;
    mockFn._mockReturnValueQueue = [];
    mockFn._mockImplementationQueue = [];
    
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
      return mockFn.mockImplementation(function() {
        return this;
      });
    };

    mockFn.withImplementation = (fn, callback) => {
      const originalImplementation = mockFn._defaultImplementation;
      mockFn.mockImplementation(fn);
      const result = callback();
      if (result && typeof result.then === 'function') {
        return result.finally(() => mockFn.mockImplementation(originalImplementation));
      }
      mockFn.mockImplementation(originalImplementation);
      return result;
    };

    return mockFn;
  }

  _generateMockPrototype(protoMetadata) {
    const protoMock = {};
    if (protoMetadata.members) {
      for (const memberName in protoMetadata.members) {
        protoMock[memberName] = this.generateFromMetadata(protoMetadata.members[memberName]);
      }
    }
    return protoMock;
  }
}

export { ModuleMocker };
