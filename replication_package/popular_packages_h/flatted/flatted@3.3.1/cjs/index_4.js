'use strict';

const {parse: $parse, stringify: $stringify} = JSON;
const Primitive = String;   // Can also be Number for numeric indexing
const objectType = 'object';
const primitiveType = 'string'; // Could also be 'number'
const ignorePlaceholder = {};
const noop = (_, value) => value;

const toPrimitive = value =>
  value instanceof Primitive ? Primitive(value) : value;

const fromPrimitive = (_, value) =>
  typeof value === primitiveType ? new Primitive(value) : value;

const reviveReferences = (input, parsed, output, reviver) => {
  const lazyUpdate = [];
  const keys = Object.keys(output);

  for (const key of keys) {
    const value = output[key];
    if (value instanceof Primitive) {
      const temp = input[value];
      if (typeof temp === objectType && !parsed.has(temp)) {
        parsed.add(temp);
        output[key] = ignorePlaceholder;
        lazyUpdate.push({key, args: [input, parsed, temp, reviver]});
      } else {
        output[key] = reviver.call(output, key, temp);
      }
    } else if (output[key] !== ignorePlaceholder) {
      output[key] = reviver.call(output, key, value);
    }
  }

  for (const {key, args} of lazyUpdate) {
    output[key] = reviver.call(output, key, reviveReferences(...args));
  }

  return output;
};

const setReference = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

/**
 * Converts a flatted string into a JS value.
 * @param {string} text
 * @param {Function} [reviver]
 * @returns {any}
 */
const parse = (text, reviver) => {
  const input = $parse(text, fromPrimitive).map(toPrimitive);
  const rootValue = input[0];
  const reviveFn = reviver || noop;

  const result = (typeof rootValue === objectType && rootValue)
    ? reviveReferences(input, new Set(), rootValue, reviveFn)
    : rootValue;

  return reviveFn.call({'': result}, '', result);
};

/**
 * Converts a JS value into a flatted string.
 * @param {any} value
 * @param {Function | Array | null} replacer
 * @param {string | number} [space]
 * @returns {string}
 */
const stringify = (value, replacer, space) => {
  const replacerFn = replacer && typeof replacer === objectType
    ? (k, v) => (k === '' || replacer.indexOf(k) !== -1 ? v : undefined)
    : (replacer || noop);

  const knownReferences = new Map();
  const input = [];
  const output = [];
  let index = +setReference(knownReferences, input, replacerFn.call({'': value}, '', value));
  let isFirstRun = !index;

  while (index < input.length) {
    isFirstRun = true;
    output[index] = $stringify(input[index++], replaceValue, space);
  }

  return `[${output.join(',')}]`;

  function replaceValue(key, value) {
    if (isFirstRun) {
      isFirstRun = !isFirstRun;
      return value;
    }

    const replacement = replacerFn.call(this, key, value);
    switch (typeof replacement) {
      case objectType:
        if (replacement === null) return replacement;
      case primitiveType:
        return knownReferences.get(replacement) || setReference(knownReferences, input, replacement);
    }
    return replacement;
  }
};

/**
 * Converts a generic value into a JSON serializable object without losing recursion.
 * @param {any} value
 * @returns {any}
 */
const toJSON = value => $parse(stringify(value));

/**
 * Converts a previously serialized object with recursion into a recursive one.
 * @param {any} value
 * @returns {any}
 */
const fromJSON = value => parse($stringify(value));

exports.parse = parse;
exports.stringify = stringify;
exports.toJSON = toJSON;
exports.fromJSON = fromJSON;
