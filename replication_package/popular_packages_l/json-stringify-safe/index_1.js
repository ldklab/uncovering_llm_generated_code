'use strict';

function jsonStringifySafe(obj, serializer = null, indent, decycler = () => '[Circular]') {
    const stack = [];
    const keys = [];

    function serializerWrapper(key, value) {
        if (stack.length) {
            const thisPos = stack.indexOf(this);
            if (~thisPos) {
                stack.splice(thisPos + 1);
                keys.splice(thisPos, Infinity, key);
            } else {
                stack.push(this);
                keys.push(key);
            }
            if (~stack.indexOf(value)) {
                value = decycler.call(this, key, value);
            }
        } else {
            stack.push(value);
        }

        return serializer ? serializer.call(this, key, value) : value;
    }

    return JSON.stringify(obj, serializerWrapper, indent);
}

jsonStringifySafe.getSerialize = function(serializer = null, decycler = () => '[Circular]') {
    const stack = [];
    const keys = [];

    return function(key, value) {
        if (stack.length) {
            const thisPos = stack.indexOf(this);
            if (~thisPos) {
                stack.splice(thisPos + 1);
                keys.splice(thisPos, Infinity, key);
            } else {
                stack.push(this);
                keys.push(key);
            }
            if (~stack.indexOf(value)) {
                value = decycler.call(this, key, value);
            }
        } else {
            stack.push(value);
        }

        return serializer ? serializer.call(this, key, value) : value;
    };
};

module.exports = jsonStringifySafe;
