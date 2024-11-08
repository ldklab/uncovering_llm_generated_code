class ModuleMocker {
  constructor(globalScope) {
    this.globalScope = globalScope;
    this.functionCallOrder = 1;
    this.mockInstanceMap = new Map();
  }

  createMockFromMetadata(metadata) {
    if (metadata.type !== 'function') {
      return () => {};
    }

    const mockFunc = this.createMockFunction();
    if (metadata.members) {
      for (const key in metadata.members) {
        if (key === 'prototype') {
          mockFunc.prototype = this._createMockPrototype(metadata.members.prototype);
        } else {
          mockFunc[key] = this.createMockFromMetadata(metadata.members[key]);
        }
      }
    }

    return mockFunc;
  }

  extractMetadata(entity) {
    if (Array.isArray(entity)) {
      return {type: 'array'};
    }
    if (typeof entity === 'function') {
      return {type: 'function'};
    }
    if (typeof entity === 'object') {
      return {type: 'object', members: {}};
    }
    return {type: 'ref'};
  }

  createMockFunction(implementation = () => {}) {
    const mockFunction = (...args) => {
      mockFunction.mock.calls.push(args);
      mockFunction.mock.instances.push(this);
      mockFunction.mock.callOrder.push(this.functionCallOrder++);
      const returnValue = this.returnValueQueue.length
        ? this.returnValueQueue.shift()
        : this.defaultReturnValue;
      return returnValue === undefined ? mockFunction.defaultImplementation(...args) : returnValue;
    };
    
    mockFunction.mock = {
      calls: [],
      instances: [],
      callOrder: [],
    };
    mockFunction.defaultImplementation = implementation;
    mockFunction.defaultReturnValue = undefined;
    mockFunction.returnValueQueue = [];
    mockFunction.implementationQueue = [];
    
    mockFunction.setMockReturnValueOnce = (value) => {
      mockFunction.returnValueQueue.push(value);
      return mockFunction;
    };

    mockFunction.setMockReturnValue = (value) => {
      mockFunction.defaultReturnValue = value;
      return mockFunction;
    };

    mockFunction.setMockImplementationOnce = (fn) => {
      mockFunction.implementationQueue.push(fn);
      return mockFunction;
    };

    mockFunction.setMockImplementation = (fn) => {
      mockFunction.defaultImplementation = fn;
      return mockFunction;
    };

    mockFunction.setMockReturnThis = () => {
      return mockFunction.setMockImplementation(function() {
        return this;
      });
    };

    mockFunction.temporaryImplementation = (fn, callback) => {
      const originalImplementation = mockFunction.defaultImplementation;
      mockFunction.setMockImplementation(fn);
      const result = callback();
      if (result && typeof result.then === 'function') {
        return result.finally(() => mockFunction.setMockImplementation(originalImplementation));
      }
      mockFunction.setMockImplementation(originalImplementation);
      return result;
    };

    return mockFunction;
  }

  _createMockPrototype(prototypeMetadata) {
    const prototypeMock = {};
    if (prototypeMetadata.members) {
      for (const key in prototypeMetadata.members) {
        prototypeMock[key] = this.createMockFromMetadata(prototypeMetadata.members[key]);
      }
    }
    return prototypeMock;
  }
}

export { ModuleMocker };
