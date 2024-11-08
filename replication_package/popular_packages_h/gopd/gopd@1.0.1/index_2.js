'use strict';

const GetIntrinsic = require('get-intrinsic');

let objectGetOwnPropertyDescriptor = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if (objectGetOwnPropertyDescriptor) {
	try {
		objectGetOwnPropertyDescriptor([], 'length');
	} catch (error) {
		// The method doesn't work properly (e.g., in IE 8)
		objectGetOwnPropertyDescriptor = null;
	}
}

module.exports = objectGetOwnPropertyDescriptor;
