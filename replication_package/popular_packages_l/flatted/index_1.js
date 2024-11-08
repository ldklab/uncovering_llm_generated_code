// flatted.js
'use strict';

const Primitive = String;
const primitiveType = 'string';

function stringify(value, replacer, space) {
  let currentIndex = -1;
  let objectReferences = new Map();

  function flatten(obj) {
    if (typeof obj === primitiveType || obj === null) {
      return obj;
    }

    let reference = objectReferences.get(obj);
    if (!reference) {
      reference = new Primitive(String(++currentIndex));
      objectReferences.set(obj, reference);

      if (typeof obj === 'object') {
        const isArray = Array.isArray(obj);
        const flatObject = isArray ? [] : {};
        objectReferences.set(reference, flatObject);

        if (isArray) {
          obj.forEach((item, index) => {
            flatObject[index] = flatten(item);
          });
        } else {
          for (const key in obj) {
            flatObject[key] = flatten(obj[key]);
          }
        }
        reference = flatObject;
      }
    }
    return reference;
  }

  const flattenedValue = flatten(value);
  return JSON.stringify(flattenedValue, replacer, space);
}

function parse(text, reviver) {
  const parsedValue = JSON.parse(text);
  const referenceMap = new Map();

  function reconstruct(obj) {
    if (typeof obj === primitiveType) {
      return referenceMap.has(obj) ? referenceMap.get(obj) : obj;
    }

    const reconstructed = Array.isArray(obj) ? [] : {};
    referenceMap.set(obj, reconstructed);

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        reconstructed[index] = reconstruct(item);
      });
    } else {
      for (const key in obj) {
        reconstructed[key] = reconstruct(obj[key]);
      }
    }
    return reconstructed;
  }

  const rebuiltValue = reconstruct(parsedValue);
  if (reviver) {
    (function revive(obj, key) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        for (const innerKey in value) {
          revive(value, innerKey);
        }
        obj[key] = reviver.call(obj, key, value);
      }
    })(rebuiltValue, '');
  }
  return rebuiltValue;
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
