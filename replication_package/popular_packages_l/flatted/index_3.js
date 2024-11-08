// flatted.js
'use strict';

function stringify(value, replacer, space) {
  const Primitive = String;
  const map = new Map();
  let index = 0;
  
  function flatten(object) {
    if (typeof object !== 'object' || object === null) {
      return object;
    }

    if (map.has(object)) {
      return map.get(object);
    }

    const id = new Primitive('' + index++);
    map.set(object, id);

    const isArray = Array.isArray(object);
    const result = isArray ? [] : {};

    map.set(id, result);

    if (isArray) {
      object.forEach((item, i) => {
        result[i] = flatten(item);
      });
    } else {
      for (const key in object) {
        result[key] = flatten(object[key]);
      }
    }

    return id;
  }

  const flattened = flatten(value);
  return JSON.stringify(flattened, replacer, space);
}

function parse(text, reviver) {
  const map = new Map();
  const input = JSON.parse(text);

  function build(object) {
    if (typeof object !== 'object' || object === null) {
      return object;
    }

    if (map.has(object)) {
      return map.get(object);
    }

    const isArray = Array.isArray(object);
    const result = isArray ? [] : {};

    map.set(object, result);

    if (isArray) {
      object.forEach((item, i) => {
        result[i] = typeof item === 'string' && map.has(item) ? map.get(item) : build(item);
      });
    } else {
      for (const key in object) {
        const value = object[key];
        result[key] = typeof value === 'string' && map.has(value) ? map.get(value) : build(value);
      }
    }

    return result;
  }

  const reconstructed = build(input);

  if (reviver) {
    (function revive(holder, key) {
      const value = holder[key];
      if (typeof value === 'object' && value !== null) {
        for (const k in value) {
          revive(value, k);
        }
        holder[key] = reviver.call(holder, key, value);
      }
    })({ '': reconstructed }, '');
  }

  return reconstructed;
}

function toJSON(value) {
  return stringify(value);
}

function fromJSON(value, reviver) {
  return parse(value, reviver);
}

module.exports = {
  stringify,
  parse,
  toJSON,
  fromJSON
};
