'use strict';

// Create an object 'test' with its own property 'foo'
var test = {
  __proto__: null, // Ensures 'test' does not inherit from any other object
  foo: {} // 'foo' is an own property of 'test'
};

// Reference to the standard JavaScript Object
var $Object = Object;

// Export the function that checks the prototype functionality
module.exports = function hasProto() {
  // Try to create an object with 'test' as its prototype
  var newObj = { __proto__: test };
  
  // Check two conditions:
  // 1. 'newObj' should have access to 'test' properties through the prototype chain
  // 2. 'test' should not be an instance of 'Object' (ensure it has no prototype)
  return newObj.foo === test.foo && !(test instanceof $Object);
};
