"use strict";

const acorn = require("acorn");
const jsx = require("acorn-jsx");
const astNodeTypes = require("./lib/ast-node-types");
const espree = require("./lib/espree");
const { getLatestEcmaVersion, getSupportedEcmaVersions } = require("./lib/options");

// Parsers initialization object
const parsers = {
    _regular: null,
    _jsx: null,

    get regular() {
        if (this._regular === null) {
            this._regular = acorn.Parser.extend(espree());
        }
        return this._regular;
    },

    get jsx() {
        if (this._jsx === null) {
            this._jsx = acorn.Parser.extend(jsx(), espree());
        }
        return this._jsx;
    },

    get(options) {
        const useJsx = Boolean(options?.ecmaFeatures?.jsx);
        return useJsx ? this.jsx : this.regular;
    }
};

// Tokenizer function
function tokenize(code, options) {
    const Parser = parsers.get(options);

    if (!options || options.tokens !== true) {
        options = Object.assign({}, options, { tokens: true });
    }

    return new Parser(options, code).tokenize();
}

// Parser function
function parse(code, options) {
    const Parser = parsers.get(options);
    return new Parser(options, code).parse();
}

// Exporting module functionalities
exports.version = require("./package.json").version;
exports.tokenize = tokenize;
exports.parse = parse;
exports.Syntax = (() => {
    const types = Object.create(null);
    for (const name in astNodeTypes) {
        if (Object.hasOwnProperty.call(astNodeTypes, name)) {
            types[name] = astNodeTypes[name];
        }
    }
    return Object.freeze(types);
})();
exports.VisitorKeys = () => require("eslint-visitor-keys").KEYS();
exports.latestEcmaVersion = getLatestEcmaVersion();
exports.supportedEcmaVersions = getSupportedEcmaVersions();
