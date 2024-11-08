'use strict';

const { parse: nativeParse, stringify: nativeStringify } = JSON;
const { keys } = Object;

const Primitive = String;
const primitiveType = 'string';

const ignored = {};
const objectType = 'object';
const noop = (_, value) => value;

const handlePrimitives = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const identifyPrimitives = (_, value) => (
  typeof value === primitiveType ? new Primitive(value) : value
);

const reviveStructure = (input, parsed, output, reviver) => {
  const deferred = [];
  for (const key of keys(output)) {
    const value = output[key];
    if (value instanceof Primitive) {
      const temp = input[value];
      if (typeof temp === objectType && !parsed.has(temp)) {
        parsed.add(temp);
        output[key] = ignored;
        deferred.push({ key, args: [input, parsed, temp, reviver] });
      } else {
        output[key] = reviver.call(output, key, temp);
      }
    } else if (output[key] !== ignored) {
      output[key] = reviver.call(output, key, value);
    }
  }
  for (const { key, args } of deferred) {
    output[key] = reviver.call(output, key, reviveStructure(...args));
  }
  return output;
};

const setIndex = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

const parse = (text, reviver) => {
  const parsedInput = nativeParse(text, identifyPrimitives).map(handlePrimitives);
  const initialValue = parsedInput[0];
  const reviverFunction = reviver || noop;
  const resultValue = (typeof initialValue === objectType && initialValue) ?
    reviveStructure(parsedInput, new Set(), initialValue, reviverFunction) :
    initialValue;
  return reviverFunction.call({ '': resultValue }, '', resultValue);
};
exports.parse = parse;

const stringify = (value, replacer, space) => {
  const reviverFunction = replacer && typeof replacer === objectType ?
    (key, val) => (key === '' || replacer.includes(key) ? val : undefined) :
    (replacer || noop);
  
  const known = new Map();
  const input = [];
  const output = [];
  let index = +setIndex(known, input, reviverFunction.call({ '': value }, '', value));
  let isFirstRun = !index;

  while (index < input.length) {
    isFirstRun = true;
    output[index] = nativeStringify(input[index++], replace, space);
  }
  
  return '[' + output.join(',') + ']';

  function replace(key, value) {
    if (isFirstRun) {
      isFirstRun = false;
      return value;
    }
    const processedValue = reviverFunction.call(this, key, value);
    if (typeof processedValue === objectType && processedValue !== null) {
      return known.get(processedValue) || setIndex(known, input, processedValue);
    }
    return processedValue;
  }
};
exports.stringify = stringify;

const toJSON = value => nativeParse(stringify(value));
exports.toJSON = toJSON;

const fromJSON = value => parse(nativeStringify(value));
exports.fromJSON = fromJSON;
