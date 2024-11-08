'use strict';

const Primitive = String;
const primitive = 'string';

function stringify(value, replacer, space) {
  let index = null;
  let stringified = new Primitive('0');

  function flatten(object, map) {
    let tmp = (typeof object === primitive) ? object : (map.get(object) || new Primitive('' + (++index)));
    
    if (!map.has(object)) {
      map.set(object, tmp);

      if (typeof object === 'object' && object) {
        const isArray = Array.isArray(object);
        const arrTmp = isArray ? [] : {};
        map.set(tmp, arrTmp);

        if (isArray) {
          object.forEach((value, i) => arrTmp[i] = flatten(value, map));
          tmp = arrTmp;
        } else {
          for (const key in object) {
            arrTmp[key] = flatten(object[key], map);
          }
          tmp = arrTmp;
        }
      }
    }
    return tmp;
  }

  const result = flatten(value, new Map());
  return JSON.stringify(result, replacer, space);
}

function parse(text, reviver) {
  const input = JSON.parse(text);
  const map = new Map();

  function build(object) {
    const reconstructed = Array.isArray(object) ? [] : {};
    map.set(object, reconstructed);

    if (Array.isArray(object)) {
      object.forEach((item, i) => {
        if (typeof item == primitive) {
          map.has(item) ? reconstructed[i] = map.get(item) : map.set(item, reconstructed[i] = []);
        } else {
          reconstructed[i] = item;
        }
      });
    } else {
      for (const key in object) {
        const value = object[key];
        if (typeof value == primitive) {
          map.has(value) ? reconstructed[key] = map.get(value) : map.set(value, reconstructed[key] = {});
        } else {
          reconstructed[key] = value;
        }
      }
    }
    return reconstructed;
  }

  const fixed = build(input);
  return reviver ? (function revive(obj, k) {
    const v = obj[k];
    if (v && typeof v === 'object') {
      obj[k] = null;
      for (k in v) {
        revive(v, k);
      }
      obj[k] = reviver.call(obj, k, v);
    }
  })(fixed, '') : fixed;
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
