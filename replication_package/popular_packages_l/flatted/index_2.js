// flatted.js
'use strict';

const Primitive = String;
const primitive = 'string';

function stringify(value, replacer, space) {
  let uniqueIndex = 0;
  const objectMap = new Map();

  function flatten(obj) {
    if (typeof obj === primitive) return obj;
    if (objectMap.has(obj)) return objectMap.get(obj);

    const reference = new Primitive(String(++uniqueIndex));
    objectMap.set(obj, reference);

    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      const flatObj = isArray ? [] : {};
      objectMap.set(reference, flatObj);

      if (isArray) {
        for (let i = 0; i < obj.length; i++) {
          flatObj[i] = flatten(obj[i]);
        }
      } else {
        for (const key in obj) {
          flatObj[key] = flatten(obj[key]);
        }
      }
    }

    return reference;
  }

  const flattenedValue = flatten(value);
  return JSON.stringify(flattenedValue, replacer, space);
}

function parse(text, reviver) {
  const parsedData = JSON.parse(text);
  const objectMap = new Map();

  function reconstruct(obj) {
    if (objectMap.has(obj)) return objectMap.get(obj);

    const isArray = Array.isArray(obj);
    const rebuiltObj = isArray ? [] : {};
    objectMap.set(obj, rebuiltObj);

    if (isArray) {
      obj.forEach((item, index) => {
        rebuiltObj[index] = (typeof item === primitive && objectMap.has(item)) ? objectMap.get(item) : reconstruct(item);
      });
    } else {
      for (const key in obj) {
        const value = obj[key];
        rebuiltObj[key] = (typeof value === primitive && objectMap.has(value)) ? objectMap.get(value) : reconstruct(value);
      }
    }
    return rebuiltObj;
  }

  const result = reconstruct(parsedData);
  if (!reviver) return result;

  function deepRevive(holder, key) {
    const value = holder[key];
    if (value && typeof value === 'object') {
      for (const k in value) {
        deepRevive(value, k);
      }
      holder[key] = reviver.call(holder, key, value);
    }
  }

  deepRevive({ "": result }, "");
  return result;
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
