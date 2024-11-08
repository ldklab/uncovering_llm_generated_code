"use strict";

const keywords = require("./keywords");

const ajvKeywords = (ajv, keyword) => {
    const applyKeyword = k => {
        const defFunc = keywords[k];
        if (!defFunc) throw new Error("Unknown keyword " + k);
        defFunc(ajv);
    };

    if (Array.isArray(keyword)) {
        keyword.forEach(applyKeyword);
    } else if (keyword) {
        applyKeyword(keyword);
    } else {
        for (const k in keywords) {
            applyKeyword(k);
        }
    }

    return ajv;
};

ajvKeywords.get = (keyword) => {
    const defFunc = keywords[keyword];
    if (!defFunc) throw new Error("Unknown keyword " + keyword);
    return defFunc;
};

module.exports = ajvKeywords;
