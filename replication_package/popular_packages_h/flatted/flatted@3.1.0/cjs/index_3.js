'use strict';
/*! (c) 2020 Andrea Giammarchi */

const { parse: nativeParse, stringify: nativeStringify } = JSON;
const { keys } = Object;

const Primitive = String;   // Can also be set to Number
const primitiveType = 'string'; // Can also be 'number'

const IGNORED = {};
const OBJECT_TYPE = 'object';

const defaultReviver = (_, value) => value;

const convertToPrimitive = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const parsePrimitive = (_, value) => (
  typeof value === primitiveType ? new Primitive(value) : value
);

const revive = (input, parsed, output, reviver) => {
  const pending = [];
  for (const key of keys(output)) {
    const value = output[key];
    if (value instanceof Primitive) {
      const resolvedValue = input[value];
      if (typeof resolvedValue === OBJECT_TYPE && !parsed.has(resolvedValue)) {
        parsed.add(resolvedValue);
        output[key] = IGNORED;
        pending.push({ key, args: [input, parsed, resolvedValue, reviver] });
      } else {
        output[key] = reviver.call(output, key, resolvedValue);
      }
    } else if (output[key] !== IGNORED) {
      output[key] = reviver.call(output, key, value);
    }
  }
  for (const { key, args } of pending) {
    output[key] = reviver.call(output, key, revive.apply(null, args));
  }
  return output;
};

const getIndex = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

const parse = (text, reviver) => {
  const inputArray = nativeParse(text, parsePrimitive).map(convertToPrimitive);
  const rootValue = inputArray[0];
  const reviverFunction = reviver || defaultReviver;
  const result = typeof rootValue === OBJECT_TYPE && rootValue
    ? revive(inputArray, new Set(), rootValue, reviverFunction)
    : rootValue;
  return reviverFunction.call({ '': result }, '', result);
};
exports.parse = parse;

const stringify = (value, replacer, space) => {
  const resolve = replacer && typeof replacer === OBJECT_TYPE
    ? (key, val) => (key === '' || replacer.includes(key) ? val : undefined)
    : (replacer || defaultReviver);

  const knownObjects = new Map();
  const inputValues = [];
  const outputStrings = [];
  let index = +getIndex(knownObjects, inputValues, resolve.call({ '': value }, '', value));
  let isFirstRun = !index;

  while (index < inputValues.length) {
    isFirstRun = true;
    outputStrings[index] = nativeStringify(inputValues[index++], handleCircularReferences, space);
  }
  return `[${outputStrings.join(',')}]`;

  function handleCircularReferences(key, value) {
    if (isFirstRun) {
      isFirstRun = false;
      return value;
    }
    const processedValue = resolve.call(this, key, value);
    switch (typeof processedValue) {
      case OBJECT_TYPE:
        if (processedValue === null) return processedValue;
      case primitiveType:
        return knownObjects.get(processedValue) || getIndex(knownObjects, inputValues, processedValue);
    }
    return processedValue;
  }
};
exports.stringify = stringify;
