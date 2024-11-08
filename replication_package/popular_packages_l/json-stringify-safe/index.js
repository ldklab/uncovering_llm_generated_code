'use strict';

function jsonStringifySafe(obj, serializer, indent, decycler) {
    var stack = [];
    var keys = [];

    if (!decycler) {
        decycler = function() {
            return '[Circular]';
        };
    }

    function serializerWrapper(key, value) {
        if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) {
                value = decycler.call(this, key, value);
            }
        } else stack.push(value);

        return serializer == null ? value : serializer.call(this, key, value);
    }

    return JSON.stringify(obj, serializerWrapper, indent);
}

jsonStringifySafe.getSerialize = function(serializer, decycler) {
    var stack = [];
    var keys = [];

    if (!decycler) {
        decycler = function() {
            return '[Circular]';
        };
    }

    return function(key, value) {
        if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) {
                value = decycler.call(this, key, value);
            }
        } else stack.push(value);

        return serializer == null ? value : serializer.call(this, key, value);
    };
};

module.exports = jsonStringifySafe;
