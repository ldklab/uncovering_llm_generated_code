'use strict';

const GetIntrinsic = require('get-intrinsic');

let getOwnPropertyDescriptor = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if (getOwnPropertyDescriptor) {
	try {
		getOwnPropertyDescriptor([], 'length');
	} catch (error) {
		// Handling potential issues in environments like IE 8
		getOwnPropertyDescriptor = null;
	}
}

module.exports = getOwnPropertyDescriptor;
