'use strict';

var isMap = require('is-map');
var isSet = require('is-set');
var isWeakMap = require('is-weakmap');
var isWeakSet = require('is-weakset');

function identifyCollectionType(value) {
	if (value && typeof value === 'object') {
		if (isMap(value)) {
			return 'Map';
		}
		if (isSet(value)) {
			return 'Set';
		}
		if (isWeakMap(value)) {
			return 'WeakMap';
		}
		if (isWeakSet(value)) {
			return 'WeakSet';
		}
	}
	return false;
}

module.exports = identifyCollectionType;
