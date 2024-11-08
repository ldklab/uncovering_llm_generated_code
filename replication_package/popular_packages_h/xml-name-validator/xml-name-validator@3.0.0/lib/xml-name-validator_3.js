"use strict";
const parser = require("./generated-parser.js");

function validateName(inputName) {
    return parseAndMap(parser.startWith("Name").exec(inputName));
}

function validateQName(inputQname) {
    return parseAndMap(parser.startWith("QName").exec(inputQname));
}

function parseAndMap(parseResult) {
    return {
        success: parseResult.success,
        error: parseResult.error ? parser.getTrace(parseResult.error.message) : null
    };
}

exports.name = validateName;
exports.qname = validateQName;
