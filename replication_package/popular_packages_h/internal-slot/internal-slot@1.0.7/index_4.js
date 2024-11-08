'use strict';

const hasOwn = require('hasown');
const channel = require('side-channel')();

const $TypeError = require('es-errors/type');

const SLOT = {
	assert: function (object, slot) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new $TypeError('`object` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		channel.assert(object);
		if (!SLOT.has(object, slot)) {
			throw new $TypeError('`' + slot + '` is not present on `object`');
		}
	},
	get: function (object, slot) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new $TypeError('`object` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		const slots = channel.get(object);
		return slots && slots['$' + slot];
	},
	has: function (object, slot) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new $TypeError('`object` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		const slots = channel.get(object);
		return !!slots && hasOwn(slots, '$' + slot);
	},
	set: function (object, slot, value) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new $TypeError('`object` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		let slots = channel.get(object);
		if (!slots) {
			slots = {};
			channel.set(object, slots);
		}
		slots['$' + slot] = value;
	}
};

if (Object.freeze) {
	Object.freeze(SLOT);
}

module.exports = SLOT;
