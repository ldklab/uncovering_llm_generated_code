'use strict';

const { parse: baseParse, stringify: baseStringify } = JSON;
const { keys } = Object;

const Primitive = String;
const primitiveType = 'string';

const ignoreMarker = {};
const objectType = 'object';

const noop = (_, value) => value;

const toPrimitive = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const fromPrimitive = (_, value) => (
  typeof value === primitiveType ? new Primitive(value) : value
);

const reviveStructure = (input, parsedSet, target, reviverFn) => {
  const pending = [];
  keys(target).forEach(key => {
    const value = target[key];
    if (value instanceof Primitive) {
      const actualValue = input[value];
      if (typeof actualValue === objectType && !parsedSet.has(actualValue)) {
        parsedSet.add(actualValue);
        target[key] = ignoreMarker;
        pending.push({ key, args: [input, parsedSet, actualValue, reviverFn] });
      } else {
        target[key] = reviverFn.call(target, key, actualValue);
      }
    } else if (target[key] !== ignoreMarker) {
      target[key] = reviverFn.call(target, key, value);
    }
  });
  pending.forEach(({ key, args }) => {
    target[key] = reviverFn.call(target, key, reviveStructure.apply(null, args));
  });
  return target;
};

const setIdentifier = (knownMap, inputArray, value) => {
  const index = Primitive(inputArray.push(value) - 1);
  knownMap.set(value, index);
  return index;
};

const customParse = (text, reviver) => {
  const inputArray = baseParse(text, fromPrimitive).map(toPrimitive);
  const rootValue = inputArray[0];
  const reviverFn = reviver || noop;
  const result = typeof rootValue === objectType && rootValue ?
    reviveStructure(inputArray, new Set(), rootValue, reviverFn) :
    rootValue;
  return reviverFn.call({ '': result }, '', result);
};

exports.parse = customParse;

const customStringify = (value, replacer, space) => {
  const replacerFn = typeof replacer === objectType ?
    (key, val) => (key === '' || replacer.includes(key) ? val : undefined) :
    (replacer || noop);
  const knownMap = new Map();
  const inputArray = [];
  const outputArray = [];
  let index = +setIdentifier(knownMap, inputArray, replacerFn.call({ '': value }, '', value));
  let isFirstRun = index === 0;
  
  while (index < inputArray.length) {
    isFirstRun = true;
    outputArray[index] = baseStringify(inputArray[index++], replaceFunction, space);
  }
  return '[' + outputArray.join(',') + ']';

  function replaceFunction(key, value) {
    if (isFirstRun) {
      isFirstRun = false;
      return value;
    }
    const transformed = replacerFn.call(this, key, value);
    switch (typeof transformed) {
      case objectType:
        if (transformed === null) return transformed;
      case primitiveType:
        return knownMap.get(transformed) || setIdentifier(knownMap, inputArray, transformed);
    }
    return transformed;
  }
};

exports.stringify = customStringify;
