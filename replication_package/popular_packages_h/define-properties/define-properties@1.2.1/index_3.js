'use strict';

const keys = require('object-keys');
const defineDataProperty = require('define-data-property');
const supportsDescriptors = require('has-property-descriptors')();
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

const isFunction = function (fn) {
  return typeof fn === 'function' && Object.prototype.toString.call(fn) === '[object Function]';
};

const defineProperty = function (object, name, value, predicate) {
  if (name in object) {
    if (predicate === true) {
      if (object[name] === value) {
        return;
      }
    } else if (!isFunction(predicate) || !predicate()) {
      return;
    }
  }

  if (supportsDescriptors) {
    defineDataProperty(object, name, value, true);
  } else {
    defineDataProperty(object, name, value);
  }
};

const defineProperties = function (object, map, predicates = {}) {
  let props = keys(map);
  if (hasSymbols) {
    props = props.concat(Object.getOwnPropertySymbols(map));
  }
  props.forEach(prop => {
    defineProperty(object, prop, map[prop], predicates[prop]);
  });
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;
