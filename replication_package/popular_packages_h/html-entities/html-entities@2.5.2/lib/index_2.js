"use strict";

var __assign = function() {
    __assign = Object.assign || function(target) {
        for (var sources, i = 1, len = arguments.length; i < len; i++) {
            sources = arguments[i];
            for (var property in sources) {
                if (Object.prototype.hasOwnProperty.call(sources, property)) {
                    target[property] = sources[property];
                }
            }
        }
        return target;
    };
    return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", { value: true });

var named_references_1 = require("./named-references");
var numeric_unicode_map_1 = require("./numeric-unicode-map");
var surrogate_pairs_1 = require("./surrogate-pairs");

var allNamedReferences = __assign(__assign({}, named_references_1.namedReferences), {
    all: named_references_1.namedReferences.html5
});

function replaceUsingRegExp(macroText, macroRegExp, macroReplacer) {
    macroRegExp.lastIndex = 0;
    var replaceMatch = macroRegExp.exec(macroText);
    var replaceResult;

    if (replaceMatch) {
        replaceResult = "";
        var replaceLastIndex = 0;
        do {
            if (replaceLastIndex !== replaceMatch.index) {
                replaceResult += macroText.substring(replaceLastIndex, replaceMatch.index);
            }
            var replaceInput = replaceMatch[0];
            replaceResult += macroReplacer(replaceInput);
            replaceLastIndex = replaceMatch.index + replaceInput.length;
        } while (replaceMatch = macroRegExp.exec(macroText));

        if (replaceLastIndex !== macroText.length) {
            replaceResult += macroText.substring(replaceLastIndex);
        }
    } else {
        replaceResult = macroText;
    }

    return replaceResult;
}

var encodeRegExps = {
    specialChars: /[<>'"&]/g,
    nonAscii: /[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    nonAsciiPrintable: /[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    nonAsciiPrintableOnly: /[\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    extensive: /[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g
};

var defaultEncodeOptions = {
    mode: "specialChars",
    level: "all",
    numeric: "decimal"
};

function encode(text, _options) {
    var options = _options === void 0 ? defaultEncodeOptions : _options;
    var mode = options.mode === void 0 ? "specialChars" : options.mode;
    var numeric = options.numeric === void 0 ? "decimal" : options.numeric;
    var level = options.level === void 0 ? "all" : options.level;

    if (!text) {
        return "";
    }

    var encodeRegExp = encodeRegExps[mode];
    var references = allNamedReferences[level].characters;
    var isHex = numeric === "hexadecimal";

    return replaceUsingRegExp(text, encodeRegExp, function(input) {
        var result = references[input];
        if (!result) {
            var code = input.length > 1 ? surrogate_pairs_1.getCodePoint(input, 0) : input.charCodeAt(0);
            result = (isHex ? "&#x" + code.toString(16) : "&#" + code) + ";";
        }
        return result;
    });
}
exports.encode = encode;

var defaultDecodeOptions = {
    scope: "body",
    level: "all"
};

var strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
var attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;

var baseDecodeRegExps = {
    xml: { strict: strict, attribute: attribute, body: named_references_1.bodyRegExps.xml },
    html4: { strict: strict, attribute: attribute, body: named_references_1.bodyRegExps.html4 },
    html5: { strict: strict, attribute: attribute, body: named_references_1.bodyRegExps.html5 }
};

var decodeRegExps = __assign(__assign({}, baseDecodeRegExps), {
    all: baseDecodeRegExps.html5
});

var fromCharCode = String.fromCharCode;
var outOfBoundsChar = fromCharCode(65533);

var defaultDecodeEntityOptions = {
    level: "all"
};

function getDecodedEntity(entity, references, isAttribute, isStrict) {
    var decodeResult = entity;
    var decodeEntityLastChar = entity[entity.length - 1];

    if (isAttribute && decodeEntityLastChar === "=") {
        decodeResult = entity;
    } else if (isStrict && decodeEntityLastChar !== ";") {
        decodeResult = entity;
    } else {
        var decodeResultByReference = references[entity];
        if (decodeResultByReference) {
            decodeResult = decodeResultByReference;
        } else if (entity[0] === "&" && entity[1] === "#") {
            var decodeSecondChar = entity[2];
            var decodeCode = decodeSecondChar === "x" || decodeSecondChar === "X" ? parseInt(entity.substr(3), 16) : parseInt(entity.substr(2));
            decodeResult = decodeCode >= 1114111 ? outOfBoundsChar : decodeCode > 65535 ? surrogate_pairs_1.fromCodePoint(decodeCode) : fromCharCode(numeric_unicode_map_1.numericUnicodeMap[decodeCode] || decodeCode);
        }
    }

    return decodeResult;
}

function decodeEntity(entity, _options) {
    var options = _options === void 0 ? defaultDecodeEntityOptions : _options;
    var level = options.level === void 0 ? "all" : options.level;

    if (!entity) {
        return "";
    }

    return getDecodedEntity(entity, allNamedReferences[level].entities, false, false);
}
exports.decodeEntity = decodeEntity;

function decode(text, _options) {
    var options = _options === void 0 ? defaultDecodeOptions : _options;
    var level = options.level === void 0 ? "all" : options.level;
    var scope = options.scope === void 0 ? (level === "xml" ? "strict" : "body") : options.scope;

    if (!text) {
        return "";
    }

    var decodeRegExp = decodeRegExps[level][scope];
    var references = allNamedReferences[level].entities;
    var isAttribute = scope === "attribute";
    var isStrict = scope === "strict";

    return replaceUsingRegExp(text, decodeRegExp, function(entity) {
        return getDecodedEntity(entity, references, isAttribute, isStrict);
    });
}
exports.decode = decode;