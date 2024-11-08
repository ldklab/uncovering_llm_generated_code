class ModuleMocker {
  constructor(global) {
    this.global = global;
    this.callOrderTracker = 1;
    this.mockInstances = new Map();
  }

  generateFromMetadata(metadata) {
    if (metadata.type !== 'function') {
      return () => {};
    }

    const mockFunction = this.createMockFunction();
    if (metadata.members) {
      for (const [member, memberMetadata] of Object.entries(metadata.members)) {
        if (member === 'prototype') {
          mockFunction.prototype = this.createMockPrototype(memberMetadata);
        } else {
          mockFunction[member] = this.generateFromMetadata(memberMetadata);
        }
      }
    }
    return mockFunction;
  }

  getMetadata(component) {
    if (Array.isArray(component)) {
      return { type: 'array' };
    }
    if (typeof component === 'function') {
      return { type: 'function' };
    }
    if (typeof component === 'object') {
      return { type: 'object', members: {} };
    }
    return { type: 'ref' };
  }

  createMockFunction(implementation = () => {}) {
    const mockFunction = (...args) => {
      const { calls, instances, invocationOrder } = mockFunction.mockData;
      calls.push(args);
      instances.push(this);
      invocationOrder.push(this.callOrderTracker++);
      const returnValueQueue = mockFunction.returnValueQueue;
      const returnValue = returnValueQueue.length ? returnValueQueue.shift() : mockFunction.defaultReturnValue;
      return returnValue !== undefined ? returnValue : mockFunction.defaultImplementation(...args);
    };

    mockFunction.mockData = {
      calls: [],
      instances: [],
      invocationOrder: [],
    };
    mockFunction.defaultImplementation = implementation;
    mockFunction.defaultReturnValue = undefined;
    mockFunction.returnValueQueue = [];
    mockFunction.implementationQueue = [];

    mockFunction.setReturnValueOnce = (value) => {
      mockFunction.returnValueQueue.push(value);
      return mockFunction;
    };

    mockFunction.setReturnValue = (value) => {
      mockFunction.defaultReturnValue = value;
      return mockFunction;
    };

    mockFunction.setImplementationOnce = (fn) => {
      mockFunction.implementationQueue.push(fn);
      return mockFunction;
    };

    mockFunction.setImplementation = (fn) => {
      mockFunction.defaultImplementation = fn;
      return mockFunction;
    };

    mockFunction.returnThis = () => {
      return mockFunction.setImplementation(function() {
        return this;
      });
    };

    mockFunction.withTemporaryImplementation = (fn, callback) => {
      const originalImplementation = mockFunction.defaultImplementation;
      mockFunction.setImplementation(fn);
      const result = callback();
      if (result && typeof result.then === 'function') {
        return result.finally(() => mockFunction.setImplementation(originalImplementation));
      }
      mockFunction.setImplementation(originalImplementation);
      return result;
    };

    return mockFunction;
  }

  createMockPrototype(protoMetadata) {
    const prototypeMock = {};
    if (protoMetadata.members) {
      for (const [member, memberMetadata] of Object.entries(protoMetadata.members)) {
        prototypeMock[member] = this.generateFromMetadata(memberMetadata);
      }
    }
    return prototypeMock;
  }
}

export { ModuleMocker };
