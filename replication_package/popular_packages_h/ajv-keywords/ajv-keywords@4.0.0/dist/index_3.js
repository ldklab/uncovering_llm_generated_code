"use strict";

var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });

const keywords = __importDefault(require("./keywords"));

function ajvKeywords(ajv, keyword) {
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
    const defFunc = keywords.default[keyword];
    if (!defFunc) {
        throw new Error("Unknown keyword " + keyword);
    }
    defFunc(ajv);
    return defFunc;
}

exports.default = ajvKeywords;
module.exports = ajvKeywords;
