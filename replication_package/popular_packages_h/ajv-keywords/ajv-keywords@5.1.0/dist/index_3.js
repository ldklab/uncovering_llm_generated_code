"use strict";

const { default: importedKeywords } = require('./keywords');

function ajvKeywords(ajv, keyword) {
    if (Array.isArray(keyword)) {
        keyword.forEach(k => applyKeyword(k, ajv));
        return ajv;
    }

    if (keyword) {
        applyKeyword(keyword, ajv);
        return ajv;
    }

    for (const k in importedKeywords) {
        applyKeyword(k, ajv);
    }

    return ajv;
}

ajvKeywords.get = applyKeyword;

function applyKeyword(keyword, ajv) {
    const definitionFunction = importedKeywords[keyword];
    if (!definitionFunction) {
        throw new Error(`Unknown keyword ${keyword}`);
    }
    definitionFunction(ajv);
}

module.exports = ajvKeywords;
module.exports.default = ajvKeywords;
