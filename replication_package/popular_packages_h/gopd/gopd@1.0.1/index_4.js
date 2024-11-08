'use strict';

const GetIntrinsic = require('get-intrinsic');

let objectGetOwnPropertyDescriptor = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if (objectGetOwnPropertyDescriptor) {
	try {
		objectGetOwnPropertyDescriptor([], 'length');
	} catch (error) {
		// Handling the case where IE 8 has a broken Object.getOwnPropertyDescriptor
		objectGetOwnPropertyDescriptor = null;
	}
}

module.exports = objectGetOwnPropertyDescriptor;
