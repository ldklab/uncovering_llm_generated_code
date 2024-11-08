'use strict';

const GetIntrinsic = require('get-intrinsic');
const hasToStringTag = require('has-tostringtag/shams')();
const hasOwn = require('hasown');

const $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
const toStringTag = hasToStringTag ? Symbol.toStringTag : null;

module.exports = function setToStringTag(object, value, options = {}) {
    const overrideIfSet = options.force || false;

    if (toStringTag && (overrideIfSet || !hasOwn(object, toStringTag))) {
        if ($defineProperty) {
            $defineProperty(object, toStringTag, {
                configurable: true,
                enumerable: false,
                value: value,
                writable: false
            });
        } else {
            object[toStringTag] = value;
        }
    }
};
