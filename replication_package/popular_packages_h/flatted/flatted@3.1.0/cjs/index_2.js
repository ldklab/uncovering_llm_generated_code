'use strict';
/*! (c) 2020 Andrea Giammarchi */

const {parse: nativeParse, stringify: nativeStringify} = JSON;
const {keys} = Object;

const Primitive = String;   // it could be Number
const primitiveType = 'string'; // it could be 'number'

const IGNORE_MARK = {};
const OBJECT_TYPE = 'object';

const defaultReviver = (_, value) => value;

const handlePrimitiveForStringify = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const convertToObjectForParse = (_, value) => (
  typeof value === primitiveType ? new Primitive(value) : value
);

const reviveStruct = (referenceArray, visited, currentObject, reviver) => {
  const deferred = [];
  for (const key of keys(currentObject)) {
    const value = currentObject[key];
    if (value instanceof Primitive) {
      const tempValue = referenceArray[value];
      if (typeof tempValue === OBJECT_TYPE && !visited.has(tempValue)) {
        visited.add(tempValue);
        currentObject[key] = IGNORE_MARK;
        deferred.push({ key, arguments: [referenceArray, visited, tempValue, reviver] });
      } else {
        currentObject[key] = reviver.call(currentObject, key, tempValue);
      }
    } else if (currentObject[key] !== IGNORE_MARK) {
      currentObject[key] = reviver.call(currentObject, key, value);
    }
  }
  for (const { key, arguments: args } of deferred) {
    currentObject[key] = reviver.call(currentObject, key, reviveStruct(...args));
  }
  return currentObject;
};

const assignIndex = (map, array, value) => {
  const index = Primitive(array.push(value) - 1);
  map.set(value, index);
  return index;
};

const parse = (text, reviver) => {
  const referenceArray = nativeParse(text, convertToObjectForParse).map(handlePrimitiveForStringify);
  const rootValue = referenceArray[0];
  const reviverFunction = reviver || defaultReviver;
  const result = typeof rootValue === OBJECT_TYPE && rootValue
    ? reviveStruct(referenceArray, new Set(), rootValue, reviverFunction)
    : rootValue;
  return reviverFunction.call({'': result}, '', result);
};
exports.parse = parse;

const stringify = (value, replacer, space) => {
  const replacerFunction = typeof replacer === OBJECT_TYPE
    ? (key, val) => (key === '' || replacer.includes(key) ? val : undefined)
    : replacer || defaultReviver;
  const referenceMap = new Map();
  const referenceArray = [];
  const serializedArray = [];
  let tempIndex = +assignIndex(referenceMap, referenceArray, replacerFunction.call({'': value}, '', value));
  let isFirstRun = !tempIndex;
  while (tempIndex < referenceArray.length) {
    isFirstRun = true;
    serializedArray[tempIndex] = nativeStringify(referenceArray[tempIndex++], replaceFunction, space);
  }
  return '[' + serializedArray.join(',') + ']';

  function replaceFunction(key, val) {
    if (isFirstRun) {
      isFirstRun = false;
      return val;
    }
    const transformedValue = replacerFunction.call(this, key, val);
    switch (typeof transformedValue) {
      case OBJECT_TYPE:
        if (transformedValue === null) return transformedValue;
      case primitiveType:
        return referenceMap.get(transformedValue) || assignIndex(referenceMap, referenceArray, transformedValue);
    }
    return transformedValue;
  }
};
exports.stringify = stringify;
