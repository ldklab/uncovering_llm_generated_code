'use strict';

const hasOwn = require('hasown');
const createChannel = require('side-channel');
const channel = createChannel();

const $TypeError = require('es-errors/type');

const SLOT = {
	assert: function (object, slotName) {
		this._validateInputs(object, slotName);
		this._assertChannel(object);
		if (!this.has(object, slotName)) {
			throw new $TypeError(`'${slotName}' is not present on 'object'`);
		}
	},

	get: function (object, slotName) {
		this._validateInputs(object, slotName);
		const slots = channel.get(object);
		return slots ? slots['$' + slotName] : undefined;
	},

	has: function (object, slotName) {
		this._validateInputs(object, slotName);
		const slots = channel.get(object);
		return !!slots && hasOwn(slots, '$' + slotName);
	},

	set: function (object, slotName, value) {
		this._validateInputs(object, slotName);
		let slots = channel.get(object);
		if (!slots) {
			slots = {};
			channel.set(object, slots);
		}
		slots['$' + slotName] = value;
	},

	_validateInputs: function (object, slotName) {
		if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
			throw new $TypeError('`object` is not an object');
		}
		if (typeof slotName !== 'string') {
			throw new $TypeError('`slotName` must be a string');
		}
	},

	_assertChannel: function (object) {
		channel.assert(object);
	}
};

if (Object.freeze) {
	Object.freeze(SLOT);
}

module.exports = SLOT;
