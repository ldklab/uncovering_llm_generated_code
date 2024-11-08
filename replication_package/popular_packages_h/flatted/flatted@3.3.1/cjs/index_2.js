'use strict';

// Importing and destructuring the JSON functions
const { parse: $parse, stringify: $stringify } = JSON;
const { keys } = Object;

// Primitive types and related helpers
const Primitive = String;   
const primitive = 'string';
const ignore = {};
const object = 'object';

// No-operation (default function if none specified)
const noop = (_, value) => value;

// Functions to apply onto primitives
const primitives = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const Primitives = (_, value) => (
  typeof value === primitive ? new Primitive(value) : value
);

// Revive function to reconstruct the object structure
const revive = (input, parsed, output, $) => {
  const lazy = [];
  for (let ke = keys(output), { length } = ke, y = 0; y < length; y++) {
    const k = ke[y];
    const value = output[k];
    if (value instanceof Primitive) {
      const tmp = input[value];
      if (typeof tmp === object && !parsed.has(tmp)) {
        parsed.add(tmp);
        output[k] = ignore;
        lazy.push({ k, a: [input, parsed, tmp, $] });
      } else {
        output[k] = $.call(output, k, tmp);
      }
    } else if (output[k] !== ignore) {
      output[k] = $.call(output, k, value);
    }
  }
  for (let { length } = lazy, i = 0; i < length; i++) {
    const { k, a } = lazy[i];
    output[k] = $.call(output, k, revive.apply(null, a));
  }
  return output;
};

// Set function to track known objects and generate indices
const set = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

// Parse function for handling specialized flatted strings
const parse = (text, reviver) => {
  const input = $parse(text, Primitives).map(primitives);
  const value = input[0];
  const $ = reviver || noop;
  const tmp = typeof value === object && value ?
    revive(input, new Set, value, $) :
    value;
  return $.call({ '': tmp }, '', tmp);
};
exports.parse = parse;

// Stringify function for creating specialized flatted strings
const stringify = (value, replacer, space) => {
  const $ = replacer && typeof replacer === object ?
    (k, v) => (k === '' || -1 < replacer.indexOf(k) ? v : void 0) :
    (replacer || noop);
  const known = new Map;
  const input = [];
  const output = [];
  let i = +set(known, input, $.call({ '': value }, '', value));
  let firstRun = !i;
  while (i < input.length) {
    firstRun = true;
    output[i] = $stringify(input[i++], replace, space);
  }
  return '[' + output.join(',') + ']';

  function replace(key, value) {
    if (firstRun) {
      firstRun = !firstRun;
      return value;
    }
    const after = $.call(this, key, value);
    switch (typeof after) {
      case object:
        if (after === null) return after;
      case primitive:
        return known.get(after) || set(known, input, after);
    }
    return after;
  }
};
exports.stringify = stringify;

// toJSON and fromJSON utility functions
const toJSON = value => $parse(stringify(value));
exports.toJSON = toJSON;

const fromJSON = value => parse($stringify(value));
exports.fromJSON = fromJSON;
