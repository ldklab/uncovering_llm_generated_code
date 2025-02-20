"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = exports.parse = exports.stringify = void 0;
var stableStringify = require("fast-json-stable-stringify");
var UNDEFINED = 'undefined';
function stringify(input) {
    return input === undefined ? UNDEFINED : stableStringify(input);
}
exports.stringify = stringify;
function parse(input) {
    return input === UNDEFINED ? undefined : JSON.parse(input);
}
exports.parse = parse;
function normalize(input, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.parse, parser = _c === void 0 ? parse : _c;
    var result;
    if (normalize.cache.has(input)) {
        result = normalize.cache.get(input);
    }
    else {
        var data = parser(input);
        result = stringify(data);
        if (result === input)
            result = undefined;
        normalize.cache.set(input, result);
    }
    return result === undefined ? input : result;
}
exports.normalize = normalize;
(function (normalize) {
    normalize.cache = new Map();
})(normalize = exports.normalize || (exports.normalize = {}));
