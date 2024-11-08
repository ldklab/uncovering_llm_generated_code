'use strict';

const keys = require('object-keys');
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

const toStr = Object.prototype.toString;
const concat = Array.prototype.concat;
const defineDataProperty = require('define-data-property');
const supportsDescriptors = require('has-property-descriptors')();

const isFunction = (fn) => typeof fn === 'function' && toStr.call(fn) === '[object Function]';

const defineProperty = (object, name, value, predicate) => {
	if (name in object) {
		if (predicate === true && object[name] === value) {
			return;
		}
		if (isFunction(predicate) && !predicate()) {
			return;
		}
	}
	if (supportsDescriptors) {
		defineDataProperty(object, name, value, true);
	} else {
		defineDataProperty(object, name, value);
	}
};

const defineProperties = (object, map, predicates = {}) => {
	let props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	props.forEach((prop) => {
		defineProperty(object, prop, map[prop], predicates[prop]);
	});
};

defineProperties.supportsDescriptors = Boolean(supportsDescriptors);

module.exports = defineProperties;
