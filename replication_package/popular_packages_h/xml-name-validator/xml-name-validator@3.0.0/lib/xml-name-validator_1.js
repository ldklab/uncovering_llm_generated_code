"use strict";
const parser = require("./generated-parser.js");

exports.name = function (potentialName) {
    return parseInput("Name", potentialName);
};

exports.qname = function (potentialQname) {
    return parseInput("QName", potentialQname);
};

function parseInput(startRule, input) {
    const result = parser.startWith(startRule).exec(input);
    return {
        success: result.success,
        error: result.error ? parser.getTrace(result.error.message) : null
    };
}
