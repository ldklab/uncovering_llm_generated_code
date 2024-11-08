'use strict';

const { parse: jsonParse, stringify: jsonStringify } = JSON;
const { keys } = Object;

const PrimitiveWrapper = String; // Could alternatively use Number
const typeOfPrimitive = 'string'; // Could be 'number' if using Number

const cacheIgnore = {};
const objType = 'object';

const noOperation = (_, value) => value;

const convertToPrimitive = value =>
  value instanceof PrimitiveWrapper ? PrimitiveWrapper(value) : value;

const revivePrimitives = (_, value) =>
  typeof value === typeOfPrimitive ? new PrimitiveWrapper(value) : value;

const reviveStructure = (input, parsed, output, customReviver) => {
  const deferredRevival = [];
  keys(output).forEach(k => {
    const value = output[k];
    if (value instanceof PrimitiveWrapper) {
      const refValue = input[value];
      if (typeof refValue === objType && !parsed.has(refValue)) {
        parsed.add(refValue);
        output[k] = cacheIgnore;
        deferredRevival.push({ key: k, args: [input, parsed, refValue, customReviver] });
      } else {
        output[k] = customReviver.call(output, k, refValue);
      }
    } else if (output[k] !== cacheIgnore) {
      output[k] = customReviver.call(output, k, value);
    }
  });

  deferredRevival.forEach(({ key, args }) => {
    output[key] = customReviver.call(output, key, reviveStructure(...args));
  });

  return output;
};

const assignIndex = (objectRegistry, inputs, item) => {
  const index = PrimitiveWrapper(inputs.push(item) - 1);
  objectRegistry.set(item, index);
  return index;
};

const customParse = (text, customReviver) => {
  const parsedArray = jsonParse(text, revivePrimitives).map(convertToPrimitive);
  const rootValue = parsedArray[0];
  const reviverToUse = customReviver || noOperation;
  const finalResult = typeof rootValue === objType && rootValue
                      ? reviveStructure(parsedArray, new Set(), rootValue, reviverToUse)
                      : rootValue;
  return reviverToUse.call({ '': finalResult }, '', finalResult);
};

exports.parse = customParse;

const customStringify = (value, replacer, space) => {
  const effectiveReplacer = Array.isArray(replacer)
    ? (key, val) => (key === '' || replacer.includes(key) ? val : undefined)
    : (replacer || noOperation);

  const registry = new Map();
  const inputArray = [];
  const outputArray = [];

  let currentIndex = +assignIndex(registry, inputArray, effectiveReplacer.call({ '': value }, '', value));
  let isFirstRun = currentIndex === 0;

  while (currentIndex < inputArray.length) {
    isFirstRun = true;
    outputArray[currentIndex] = jsonStringify(inputArray[currentIndex++], processReplacer, space);
  }

  return `[${outputArray.join(',')}]`;

  function processReplacer(key, val) {
    if (isFirstRun) {
      isFirstRun = false;
      return val;
    }
    const processedValue = effectiveReplacer.call(this, key, val);
    if (typeof processedValue === objType) {
      if (processedValue === null) return processedValue;
      return registry.get(processedValue) || assignIndex(registry, inputArray, processedValue);
    }
    return processedValue;
  }
};

exports.stringify = customStringify;
