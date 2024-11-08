"use strict";

const keywords = require("./keywords");

function ajvKeywords(ajv, keyword) {
    if (Array.isArray(keyword)) {
        keyword.forEach(k => applyKeyword(k, ajv));
    } else if (keyword) {
        applyKeyword(keyword, ajv);
    } else {
        Object.keys(keywords).forEach(k => applyKeyword(k, ajv));
    }
    return ajv;
}

ajvKeywords.get = applyKeyword;

function applyKeyword(keyword, ajv) {
    const keywordFunction = keywords[keyword];
    if (!keywordFunction) {
        throw new Error(`Unknown keyword ${keyword}`);
    }
    keywordFunction(ajv);
}

module.exports = ajvKeywords;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports.default = ajvKeywords;
