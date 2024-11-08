"use strict";

const keywords = require("./keywords");

function ajvKeywords(ajv, keyword) {
    if (Array.isArray(keyword)) {
        keyword.forEach(k => applyKeyword(ajv, k));
    } else if (keyword) {
        applyKeyword(ajv, keyword);
    } else {
        Object.keys(keywords).forEach(k => applyKeyword(ajv, k));
    }
    return ajv;
}

function applyKeyword(ajv, keyword) {
    const defFunc = keywords[keyword];
    if (!defFunc) {
        throw new Error("Unknown keyword " + keyword);
    }
    defFunc(ajv);
}

ajvKeywords.get = applyKeyword;

module.exports = ajvKeywords;
