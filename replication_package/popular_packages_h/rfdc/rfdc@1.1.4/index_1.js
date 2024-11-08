'use strict';
module.exports = generateDeepCopyFunction;

function generateDeepCopyFunction(options) {
  options = options || {};

  if (options.circles) return handleCircularReferences(options);
  return options.proto ? cloneWithProto : cloneWithoutProto;

  function cloneArray(array, cloneFunction) {
    const keys = Object.keys(array);
    const clonedArray = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = array[key];
      clonedArray[key] = (typeof value !== 'object' || value === null) ?
          value :
          (value instanceof Date ? new Date(value) : cloneFunction(value));
    }
    return clonedArray;
  }

  function cloneWithoutProto(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return cloneArray(obj, cloneWithoutProto);
    
    const clonedObject = {};
    for (const key in obj) {
      if (!Object.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      clonedObject[key] = (typeof value !== 'object' || value === null) ?
          value :
          (value instanceof Date ? new Date(value) : cloneWithoutProto(value));
    }
    return clonedObject;
  }

  function cloneWithProto(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return cloneArray(obj, cloneWithProto);

    const clonedObject = {};
    for (const key in obj) {
      const value = obj[key];
      clonedObject[key] = (typeof value !== 'object' || value === null) ?
          value :
          (value instanceof Date ? new Date(value) : cloneWithProto(value));
    }
    return clonedObject;
  }
}

function handleCircularReferences(options) {
  const referenceStack = [];
  const newReferenceStack = [];

  return options.proto ? cloneWithProtoCircular : cloneWithoutProtoCircular;

  function cloneArray(array, cloneFunction) {
    const keys = Object.keys(array);
    const clonedArray = new Array(keys.length);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = array[key];
      if (typeof value !== 'object' || value === null) {
        clonedArray[key] = value;
      } else if (value instanceof Date) {
        clonedArray[key] = new Date(value);
      } else {
        const existingIndex = referenceStack.indexOf(value);
        clonedArray[key] = existingIndex !== -1 ?
            newReferenceStack[existingIndex] :
            cloneFunction(value);
      }
    }
    return clonedArray;
  }

  function cloneWithoutProtoCircular(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return cloneArray(obj, cloneWithoutProtoCircular);

    const clonedObject = {};
    referenceStack.push(obj);
    newReferenceStack.push(clonedObject);

    for (const key in obj) {
      if (!Object.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      if (typeof value !== 'object' || value === null) {
        clonedObject[key] = value;
      } else if (value instanceof Date) {
        clonedObject[key] = new Date(value);
      } else {
        const existingIndex = referenceStack.indexOf(value);
        clonedObject[key] = existingIndex !== -1 ?
            newReferenceStack[existingIndex] :
            cloneWithoutProtoCircular(value);
      }
    }

    referenceStack.pop();
    newReferenceStack.pop();
    return clonedObject;
  }

  function cloneWithProtoCircular(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return cloneArray(obj, cloneWithProtoCircular);

    const clonedObject = {};
    referenceStack.push(obj);
    newReferenceStack.push(clonedObject);

    for (const key in obj) {
      const value = obj[key];
      if (typeof value !== 'object' || value === null) {
        clonedObject[key] = value;
      } else if (value instanceof Date) {
        clonedObject[key] = new Date(value);
      } else {
        const existingIndex = referenceStack.indexOf(value);
        clonedObject[key] = existingIndex !== -1 ?
            newReferenceStack[existingIndex] :
            cloneWithProtoCircular(value);
      }
    }

    referenceStack.pop();
    newReferenceStack.pop();
    return clonedObject;
  }
}
