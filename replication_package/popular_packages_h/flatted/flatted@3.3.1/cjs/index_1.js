'use strict';

const { parse: $parse, stringify: $stringify } = JSON;
const { keys } = Object;

const Primitive = String;
const primitive = 'string';
const ignore = {};
const objectType = 'object';
const noop = (_, value) => value;

const primitives = value => (value instanceof Primitive ? Primitive(value) : value);
const Primitives = (_, value) => (typeof value === primitive ? new Primitive(value) : value);

const revive = (input, parsed, output, reviver) => {
  const lazy = [];
  for (const k of keys(output)) {
    let value = output[k];
    if (value instanceof Primitive) {
      const resolvedValue = input[value];
      if (typeof resolvedValue === objectType && !parsed.has(resolvedValue)) {
        parsed.add(resolvedValue);
        output[k] = ignore;
        lazy.push({ k, args: [input, parsed, resolvedValue, reviver] });
      } else {
        output[k] = reviver.call(output, k, resolvedValue);
      }
    } else if (output[k] !== ignore) {
      output[k] = reviver.call(output, k, value);
    }
  }
  for (const { k, args } of lazy) {
    output[k] = reviver.call(output, k, revive(...args));
  }
  return output;
};

const setIndex = (map, array, value) => {
  const index = Primitive(array.push(value) - 1);
  map.set(value, index);
  return index;
};

const parse = (text, reviver) => {
  const input = $parse(text, Primitives).map(primitives);
  const rootValue = input[0];
  const customReviver = reviver || noop;
  const output = 
    typeof rootValue === objectType && rootValue
      ? revive(input, new Set(), rootValue, customReviver)
      : rootValue;
  return customReviver.call({ '': output }, '', output);
};
exports.parse = parse;

const stringify = (value, replacer, space) => {
  const customReplacer = replacer && typeof replacer === objectType
    ? (k, v) => (k === '' || replacer.includes(k) ? v : undefined)
    : (replacer || noop);
  const map = new Map();
  const input = [];
  const output = [];
  let i = setIndex(map, input, customReplacer.call({ '': value }, '', value));
  let isFirstRun = !i;
  while (i < input.length) {
    isFirstRun = true;
    output[i] = $stringify(input[i++], replace, space);
  }
  return '[' + output.join(',') + ']';

  function replace(key, value) {
    if (isFirstRun) {
      isFirstRun = false;
      return value;
    }
    const replacedValue = customReplacer.call(this, key, value);
    switch (typeof replacedValue) {
      case objectType:
        if (replacedValue === null) return replacedValue;
      case primitive:
        return map.get(replacedValue) || setIndex(map, input, replacedValue);
    }
    return replacedValue;
  }
};
exports.stringify = stringify;

const toJSON = value => $parse(stringify(value));
exports.toJSON = toJSON;

const fromJSON = value => parse($stringify(value));
exports.fromJSON = fromJSON;
