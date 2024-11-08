'use strict';

const hasOwn = require('hasown');
const channel = require('side-channel')();

const TypeError = require('es-errors/type');

const SLOT = {
	assert: function (object, slotName) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new TypeError('`object` is not an object');
		}
		if (typeof slotName !== 'string') {
			throw new TypeError('`slotName` must be a string');
		}
		channel.assert(object);
		if (!SLOT.has(object, slotName)) {
			throw new TypeError('`' + slotName + '` is not present on `object`');
		}
	},
	get: function (object, slotName) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new TypeError('`object` is not an object');
		}
		if (typeof slotName !== 'string') {
			throw new TypeError('`slotName` must be a string');
		}
		const slots = channel.get(object);
		return slots ? slots['$' + slotName] : undefined;
	},
	has: function (object, slotName) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new TypeError('`object` is not an object');
		}
		if (typeof slotName !== 'string') {
			throw new TypeError('`slotName` must be a string');
		}
		const slots = channel.get(object);
		return slots ? hasOwn(slots, '$' + slotName) : false;
	},
	set: function (object, slotName, value) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new TypeError('`object` is not an object');
		}
		if (typeof slotName !== 'string') {
			throw new TypeError('`slotName` must be a string');
		}
		let slots = channel.get(object);
		if (!slots) {
			slots = {};
			channel.set(object, slots);
		}
		slots['$' + slotName] = value;
	}
};

if (typeof Object.freeze === 'function') {
	Object.freeze(SLOT);
}

module.exports = SLOT;
