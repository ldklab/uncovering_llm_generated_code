'use strict';

var GetIntrinsic = require('get-intrinsic');

var objectGetOwnPropertyDescriptor = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if (objectGetOwnPropertyDescriptor) {
	try {
		objectGetOwnPropertyDescriptor([], 'length');
	} catch (error) {
		// Object.getOwnPropertyDescriptor is inaccessible or does not work correctly
		objectGetOwnPropertyDescriptor = null;
	}
}

module.exports = objectGetOwnPropertyDescriptor;
