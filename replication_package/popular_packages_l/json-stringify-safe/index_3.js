'use strict';

function jsonStringifySafe(obj, customSerializer = null, indent = 0, customDecycler = null) {
    const stack = [];
    const keys = [];
    
    const defaultDecycler = () => '[Circular]';
    const decycler = customDecycler || defaultDecycler;

    function serializerWrapper(key, value) {
        if (stack.length) {
            const thisIndex = stack.indexOf(this);
            if (~thisIndex) {
                stack.splice(thisIndex + 1);
                keys.splice(thisIndex, Infinity, key);
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
        return customSerializer ? customSerializer.call(this, key, value) : value;
    }

    return JSON.stringify(obj, serializerWrapper, indent);
}

jsonStringifySafe.getSerialize = function(customSerializer = null, customDecycler = null) {
    const stack = [];
    const keys = [];
    
    const defaultDecycler = () => '[Circular]';
    const decycler = customDecycler || defaultDecycler;

    return function(key, value) {
        if (stack.length) {
            const thisIndex = stack.indexOf(this);
            if (~thisIndex) {
                stack.splice(thisIndex + 1);
                keys.splice(thisIndex, Infinity, key);
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
        return customSerializer ? customSerializer.call(this, key, value) : value;
    };
};

module.exports = jsonStringifySafe;
