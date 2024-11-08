'use strict';

const GetIntrinsic = require('get-intrinsic');

const $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

const hasToStringTag = require('has-tostringtag/shams')();
const { hasOwnProperty: hasOwn } = Object.prototype;

const toStringTag = hasToStringTag ? Symbol.toStringTag : null;

/**
 * Function to set the Symbol.toStringTag property on an object.
 * @param {object} object - The target object.
 * @param {string} value - The value to set for Symbol.toStringTag.
 * @param {object} [options] - Options object.
 * @param {boolean} [options.force] - Whether to force override existing property.
 */
module.exports = function setToStringTag(object, value, options = {}) {
  const overrideIfSet = options.force;
  if (toStringTag && (overrideIfSet || !hasOwn.call(object, toStringTag))) {
    if ($defineProperty) {
      $defineProperty(object, toStringTag, {
        configurable: true,
        enumerable: false,
        value: value,
        writable: false
      });
    } else {
      object[toStringTag] = value;
    }
  }
};
