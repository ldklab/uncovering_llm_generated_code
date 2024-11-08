"use strict";

function importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}

Object.defineProperty(exports, "__esModule", { value: true });

const keywords = importDefault(require("./keywords"));

function ajvKeywords(ajv, keyword = null) {
    if (Array.isArray(keyword)) {
        keyword.forEach(k => applyKeyword(k, ajv));
    } else if (keyword) {
        applyKeyword(keyword, ajv);
    } else {
        for (const key in keywords.default) {
            applyKeyword(key, ajv);
        }
    }
    return ajv;
}

ajvKeywords.get = applyKeyword;

function applyKeyword(keyword, ajv) {
    const definitionFunction = keywords.default[keyword];
    if (!definitionFunction) {
        throw new Error(`Unknown keyword ${keyword}`);
    }
    return definitionFunction(ajv);
}

exports.default = ajvKeywords;
module.exports = ajvKeywords;
module.exports.default = ajvKeywords;
