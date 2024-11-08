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
    switch (true) {
      case Array.isArray(component):
        return { type: 'array' };
      case typeof component === 'function':
        return { type: 'function' };
      case typeof component === 'object':
        return { type: 'object', members: {} };
      default:
        return { type: 'ref' };
    }
  }

  fn(implementation = () => {}) {
    const mockFn = (...args) => {
      mockFn.mock.calls.push(args);
      mockFn.mock.instances.push(this);
      mockFn.mock.invocationCallOrder.push(this._mockFunctionCallOrder++);
      
      const returnVal = (mockFn._mockReturnValueQueue.length
        ? mockFn._mockReturnValueQueue.shift()
        : mockFn._defaultReturnValue);
      
      return returnVal !== undefined ? returnVal : mockFn._defaultImplementation(...args);
    };

    mockFn.mock = { calls: [], instances: [], invocationCallOrder: [] };
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

    mockFn.mockReturnThis = () => mockFn.mockImplementation(() => this);

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
