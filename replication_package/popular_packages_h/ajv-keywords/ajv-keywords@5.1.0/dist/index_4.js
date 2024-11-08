"use strict";

const { default: keywords } = require("./keywords");

function ajvKeywords(ajv, keyword) {
    if (Array.isArray(keyword)) {
        keyword.forEach(k => applyKeyword(k, ajv));
    } else if (keyword) {
        applyKeyword(keyword, ajv);
    } else {
        for (let k in keywords) {
            applyKeyword(k, ajv);
        }
    }
    return ajv;
}

function applyKeyword(keyword, ajv) {
    const defFunc = keywords[keyword];
    if (!defFunc) {
        throw new Error(`Unknown keyword ${keyword}`);
    }
    defFunc(ajv);
}

ajvKeywords.get = applyKeyword;

exports.default = ajvKeywords;
module.exports = ajvKeywords;
module.exports.default = ajvKeywords;
