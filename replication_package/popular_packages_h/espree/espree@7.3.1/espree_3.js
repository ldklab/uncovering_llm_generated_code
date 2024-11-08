"use strict";

const acorn = require("acorn");
const jsx = require("acorn-jsx");
const astNodeTypes = require("./lib/ast-node-types");
const espree = require("./lib/espree");
const { getLatestEcmaVersion, getSupportedEcmaVersions } = require("./lib/options");

const parsers = {
    _regular: null,
    _jsx: null,

    get regular() {
        if (!this._regular) {
            this._regular = acorn.Parser.extend(espree());
        }
        return this._regular;
    },

    get jsx() {
        if (!this._jsx) {
            this._jsx = acorn.Parser.extend(jsx(), espree());
        }
        return this._jsx;
    },

    get(options) {
        return (options && options.ecmaFeatures && options.ecmaFeatures.jsx) ? this.jsx : this.regular;
    }
};

function tokenize(code, options) {
    const Parser = parsers.get(options);

    if (!options || options.tokens !== true) {
        options = { ...options, tokens: true };
    }

    return new Parser(options, code).tokenize();
}

function parse(code, options) {
    const Parser = parsers.get(options);

    return new Parser(options, code).parse();
}

exports.version = require("./package.json").version;

exports.tokenize = tokenize;
exports.parse = parse;

exports.Syntax = (() => {
    const types = (typeof Object.create === "function") ? Object.create(null) : {};
    for (const name in astNodeTypes) {
        if (Object.hasOwnProperty.call(astNodeTypes, name)) {
            types[name] = astNodeTypes[name];
        }
    }
    return (typeof Object.freeze === "function") ? Object.freeze(types) : types;
})();

exports.VisitorKeys = (() => require("eslint-visitor-keys").KEYS)();

exports.latestEcmaVersion = getLatestEcmaVersion();
exports.supportedEcmaVersions = getSupportedEcmaVersions();
