'use strict';

const GetIntrinsic = require('get-intrinsic');

let definePropertyFunction = GetIntrinsic('%Object.defineProperty%', true) || false;

if (definePropertyFunction) {
    try {
        definePropertyFunction({}, 'test', { value: 2 });
    } catch (error) {
        definePropertyFunction = false; // Handle IE 8 or similar issues
    }
}

module.exports = definePropertyFunction;
