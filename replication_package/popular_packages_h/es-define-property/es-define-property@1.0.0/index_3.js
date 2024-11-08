'use strict';

const GetIntrinsic = require('get-intrinsic');

let defineProperty = GetIntrinsic('%Object.defineProperty%', true) || false;

if (defineProperty) {
    try {
        defineProperty({}, 'testProp', { value: 42 });
    } catch (error) {
        defineProperty = false;
    }
}

module.exports = defineProperty;
