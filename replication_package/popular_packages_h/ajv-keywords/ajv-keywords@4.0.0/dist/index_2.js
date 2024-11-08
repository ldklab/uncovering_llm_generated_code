"use strict";

const keywords = require("./keywords");

const ajvKeywords = (ajv, keyword) => {
    if (Array.isArray(keyword)) {
        for (const k of keyword) {
            addKeyword(k, ajv);
        }
        return ajv;
    }
    
    if (keyword) {
        addKeyword(keyword, ajv);
        return ajv;
    }
    
    for (const keyword in keywords) {
        addKeyword(keyword, ajv);
    }
    
    return ajv;
};

function addKeyword(keyword, ajv) {
    const defFunc = keywords[keyword];
    if (!defFunc) {
        throw new Error(`Unknown keyword ${keyword}`);
    }
    defFunc(ajv);
}

module.exports = ajvKeywords;
