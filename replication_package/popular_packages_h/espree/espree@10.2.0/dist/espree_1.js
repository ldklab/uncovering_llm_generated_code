'use strict';

const acorn = require('acorn');
const jsx = require('acorn-jsx');
const visitorKeys = require('eslint-visitor-keys');

// Utility for seamless default import handling
function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : { 'default': e };
}

// Utility to create namespaces for modules
function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    const n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(k => {
            if (k !== 'default') {
                const d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function() { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

// Namespaces for imported modules
const acornNamespace = _interopNamespace(acorn);
const jsxDefault = _interopDefaultLegacy(jsx);
const visitorKeysNamespace = _interopNamespace(visitorKeys);

// Token types compatible with Esprima
const Token = {
    Boolean: "Boolean",
    EOF: "<end>",
    Identifier: "Identifier",
    PrivateIdentifier: "PrivateIdentifier",
    Keyword: "Keyword",
    Null: "Null",
    Numeric: "Numeric",
    Punctuator: "Punctuator",
    String: "String",
    RegularExpression: "RegularExpression",
    Template: "Template",
    JSXIdentifier: "JSXIdentifier",
    JSXText: "JSXText"
};

// Utility to convert template tokens
function convertTemplatePart(tokens, code) {
    const first = tokens[0], last = tokens.at(-1);
    const value = code.slice(first.start, last.end);

    const token = {
        type: Token.Template,
        value: value,
        loc: first.loc ? { start: first.loc.start, end: last.loc.end } : undefined,
        start: first.range ? first.range[0] : undefined,
        end: last.range ? last.range[1] : undefined,
        range: first.range ? [first.range[0], last.range[1]] : undefined
    };
    return token;
}

// Class for translating tokens
class TokenTranslator {
    constructor(acornTypes, code) {
        this._acornTokTypes = acornTypes;
        this._tokens = [];
        this._curlyBrace = null;
        this._code = code;
    }

    translate(token, { ecmaVersion, jsxAttrValueToken }) {
        const type = token.type, tt = this._acornTokTypes;

        // Classifying tokens to Esprima token types
        if (type === tt.name) {
            if (token.value === "static" || (ecmaVersion > 5 && (token.value === "yield" || token.value === "let"))) {
                token.type = Token.Keyword;
            } else {
                token.type = Token.Identifier;
            }
        } else if (type === tt.privateId) {
            token.type = Token.PrivateIdentifier;
        } else if ([tt.semi, tt.comma, tt.parenL, tt.parenR, tt.braceL, tt.braceR, tt.dot, tt.bracketL, tt.bracketR, tt.colon, tt.question, tt.ellipsis, tt.arrow, tt.jsxTagStart, tt.incDec, tt.starstar, tt.jsxTagEnd, tt.prefix, tt.questionDot, tt.isAssign].includes(type) || (type.binop && !type.keyword)) {
            token.type = Token.Punctuator;
            token.value = this._code.slice(token.start, token.end);
        } else if (type === tt.jsxName) {
            token.type = Token.JSXIdentifier;
        } else if (type.label === "jsxText" || type === tt.jsxAttrValueToken) {
            token.type = Token.JSXText;
        } else if (type.keyword) {
            token.type = type.keyword === "true" || type.keyword === "false" ? Token.Boolean : type.keyword === "null" ? Token.Null : Token.Keyword;
        } else if (type === tt.num) {
            token.type = Token.Numeric;
            token.value = this._code.slice(token.start, token.end);
        } else if (type === tt.string) {
            token.value = this._code.slice(token.start, token.end);
            token.type = jsxAttrValueToken ? Token.JSXText : Token.String;
        } else if (type === tt.regexp) {
            token.type = Token.RegularExpression;
            token.value = `/${token.value.pattern}/${token.value.flags}`;
            token.regex = { pattern: token.value.pattern, flags: token.value.flags };
        }

        return token;
    }

    onToken(token, extra) {
        const tt = this._acornTokTypes, tokens = extra.tokens, tmplTokens = this._tokens;

        const translateTemplateTokens = () => {
            tokens.push(convertTemplatePart(this._tokens, this._code));
            this._tokens = [];
        };

        if (token.type === tt.eof) {
            if (this._curlyBrace) tokens.push(this.translate(this._curlyBrace, extra));
            return;
        }

        if (token.type === tt.backQuote) {
            if (this._curlyBrace) tokens.push(this.translate(this._curlyBrace, extra));
            tmplTokens.push(token);

            if (tmplTokens.length > 1) translateTemplateTokens();
            return;
        }

        if (token.type === tt.dollarBraceL) {
            tmplTokens.push(token);
            translateTemplateTokens();
            return;
        }

        if (token.type === tt.braceR) {
            if (this._curlyBrace) tokens.push(this.translate(this._curlyBrace, extra));

            this._curlyBrace = token;
            return;
        }

        if ([tt.template, tt.invalidTemplate].includes(token.type)) {
            if (this._curlyBrace) tmplTokens.push(this._curlyBrace);
            tmplTokens.push(token);
            return;
        }

        if (this._curlyBrace) tokens.push(this.translate(this._curlyBrace, extra));
        tokens.push(this.translate(token, extra));
    }
}

// ECMAScript options normalization functions
const SUPPORTED_VERSIONS = [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

function getLatestEcmaVersion() {
    return SUPPORTED_VERSIONS.at(-1);
}

function getSupportedEcmaVersions() {
    return [...SUPPORTED_VERSIONS];
}

function normalizeEcmaVersion(version = 5) {
    if (version === "latest") {
        version = getLatestEcmaVersion();
    } else if (typeof version !== "number") {
        throw new Error(`ecmaVersion must be a number or "latest".`);
    }

    if (version >= 2015) version -= 2009;
    if (!SUPPORTED_VERSIONS.includes(version)) throw new Error("Invalid ecmaVersion.");

    return version;
}

function normalizeSourceType(type = "script") {
    if (type === "script" || type === "module") return type;
    if (type === "commonjs") return "script";
    throw new Error("Invalid sourceType.");
}

function normalizeOptions(options) {
    const ecmaVersion = normalizeEcmaVersion(options.ecmaVersion);
    const sourceType = normalizeSourceType(options.sourceType);
    const ranges = options.range === true;
    const locations = options.loc === true;

    if (ecmaVersion !== 3 && options.allowReserved) {
        throw new Error("`allowReserved` is only supported when ecmaVersion is 3");
    }

    if (typeof options.allowReserved !== "undefined" && typeof options.allowReserved !== "boolean") {
        throw new Error("`allowReserved`, when present, must be `true` or `false`");
    }

    const allowReserved = ecmaVersion === 3 ? (options.allowReserved || "never") : false;
    const ecmaFeatures = options.ecmaFeatures || {};
    const allowReturnOutsideFunction = options.sourceType === "commonjs" || Boolean(ecmaFeatures.globalReturn);

    if (sourceType === "module" && ecmaVersion < 6) {
        throw new Error("sourceType 'module' is not supported when ecmaVersion < 2015.");
    }

    return { ...options, ecmaVersion, sourceType, ranges, locations, allowReserved, allowReturnOutsideFunction };
}

// Conversion function for comments
function convertAcornCommentToEsprimaComment(block, text, start, end, startLoc, endLoc, code) {
    let type = block ? "Block" : code.startsWith("#!", start) ? "Hashbang" : "Line";

    const comment = { type, value: text };
    if (start !== undefined) {
        comment.start = start;
        comment.end = end;
        comment.range = [start, end];
    }
    if (startLoc) {
        comment.loc = { start: startLoc, end: endLoc };
    }
    return comment;
}

// Main Espree parser extension for Acorn
const espree = () => (Parser => {
    const tokTypes = Object.assign({}, Parser.acorn.tokTypes);

    if (Parser.acornJsx) {
        Object.assign(tokTypes, Parser.acornJsx.tokTypes);
    }

    return class Espree extends Parser {
        constructor(opts, code) {
            if (typeof opts !== "object" || opts === null) {
                opts = {};
            }
            code = typeof code !== "string" && !(code instanceof String) ? String(code) : code;

            const originalSourceType = opts.sourceType;
            const options = normalizeOptions(opts);
            const ecmaFeatures = options.ecmaFeatures || {};
            const tokenTranslator = options.tokens ? new TokenTranslator(tokTypes, code) : null;

            const state = {
                originalSourceType: originalSourceType || options.sourceType,
                tokens: tokenTranslator ? [] : null,
                comments: options.comment === true ? [] : null,
                impliedStrict: ecmaFeatures.impliedStrict === true && options.ecmaVersion >= 5,
                ecmaVersion: options.ecmaVersion,
                jsxAttrValueToken: false,
                lastToken: null,
                templateElements: []
            };

            super({
                ecmaVersion: options.ecmaVersion,
                sourceType: options.sourceType,
                ranges: options.ranges,
                locations: options.locations,
                allowReserved: options.allowReserved,
                allowReturnOutsideFunction: options.allowReturnOutsideFunction,
                onToken: token => {
                    if (tokenTranslator) tokenTranslator.onToken(token, state);
                    if (token.type !== tokTypes.eof) state.lastToken = token;
                },
                onComment: (block, text, start, end, startLoc, endLoc) => {
                    if (state.comments) {
                        state.comments.push(convertAcornCommentToEsprimaComment(block, text, start, end, startLoc, endLoc, code));
                    }
                }
            }, code);

            this[Symbol('espree state')] = state;
        }

        tokenize() {
            do {
                this.next();
            } while (this.type !== tokTypes.eof);

            this.next();

            const tokens = this[Symbol('espree state')].tokens;
            if (this[Symbol('espree state')].comments) {
                tokens.comments = this[Symbol('espree state')].comments;
            }
            return tokens;
        }

        finishNode(...args) {
            const result = super.finishNode(...args);
            return this[Symbol('espree finish')](result);
        }

        finishNodeAt(...args) {
            const result = super.finishNodeAt(...args);
            return this[Symbol('espree finish')](result);
        }

        parse() {
            const extra = this[Symbol('espree state')];
            const program = super.parse();

            program.sourceType = extra.originalSourceType;
            if (extra.comments) program.comments = extra.comments;
            if (extra.tokens) program.tokens = extra.tokens;

            if (program.body.length) {
                const firstNode = program.body[0];

                if (program.range) {
                    program.range[0] = firstNode.range[0];
                }
                if (program.loc) {
                    program.loc.start = firstNode.loc.start;
                }
                program.start = firstNode.start;
            }

            if (extra.lastToken) {
                if (program.range) {
                    program.range[1] = extra.lastToken.range[1];
                }
                if (program.loc) {
                    program.loc.end = extra.lastToken.loc.end;
                }
                program.end = extra.lastToken.end;
            }

            this[Symbol('espree state')].templateElements.forEach(elem => {
                const startOffset = -1, endOffset = elem.tail ? 1 : 2;
                if ('range' in elem) {
                    [elem.range[0], elem.range[1]] = [elem.range[0] + startOffset, elem.range[1] + endOffset];
                }
                if ('loc' in elem) {
                    elem.loc.start.column += startOffset;
                    elem.loc.end.column += endOffset;
                }
                elem.start += startOffset;
                elem.end += endOffset;
            });

            return program;
        }

        parseTopLevel(node) {
            if (this[Symbol('espree state')].impliedStrict) {
                this.strict = true;
            }
            return super.parseTopLevel(node);
        }

        raise(pos, message) {
            const loc = Parser.acorn.getLineInfo(this.input, pos);
            const err = new SyntaxError(message);
            err.index = pos;
            err.lineNumber = loc.line;
            err.column = loc.column + 1;
            throw err;
        }

        raiseRecoverable(pos, message) {
            this.raise(pos, message);
        }

        unexpected(pos) {
            let message = "Unexpected token";
            if (pos !== null && pos !== void 0) {
                this.pos = pos;
                if (this.options.locations) {
                    while (this.pos < this.lineStart) {
                        this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
                        --this.curLine;
                    }
                }
                this.nextToken();
            }
            if (this.end > this.start) {
                message += ` ${this.input.slice(this.start, this.end)}`;
            }
            this.raise(this.start, message);
        }

        jsx_readString(quote) {
            const result = super.jsx_readString(quote);
            if (this.type === tokTypes.string) {
                this[Symbol('espree state')].jsxAttrValueToken = true;
            }
            return result;
        }

        [Symbol('espree finish')](result) {
            if (result.type === "TemplateElement") {
                this[Symbol('espree state')].templateElements.push(result);
            } else if (result.type.includes("Function") && !result.generator) {
                result.generator = false;
            }
            return result;
        }
    };
});

// Public API and version information
const version = "10.2.0";
const name = "espree";

// VisitorKeys and Syntax object setup
const VisitorKeys = (() => visitorKeysNamespace.KEYS)();
const Syntax = (() => {
    const types = Object.create(null);
    for (const key in VisitorKeys) {
        if (Object.hasOwn(VisitorKeys, key)) {
            types[key] = key;
        }
    }
    return Object.freeze(types);
})();

// Lazy initialization of Acorn parsers
const parsers = {
    _regular: null,
    _jsx: null,

    get regular() {
        if (this._regular === null) {
            this._regular = acornNamespace.Parser.extend(espree());
        }
        return this._regular;
    },

    get jsx() {
        if (this._jsx === null) {
            this._jsx = acornNamespace.Parser.extend(jsxDefault["default"](), espree());
        }
        return this._jsx;
    },

    get options() {
        return Boolean(options && options.ecmaFeatures && options.ecmaFeatures.jsx) ? this.jsx : this.regular;
    }
};

// Tokenization function using the parser
function tokenize(code, options) {
    const Parser = parsers.get(options);
    options = options ? options : {};
    options.tokens = true;
    return (new Parser(options, code)).tokenize();
}

// Parsing function to get the AST
function parse(code, options) {
    const Parser = parsers.get(options);
    return new Parser(options, code).parse();
}

// Exporting the public API
exports.Syntax = Syntax;
exports.VisitorKeys = VisitorKeys;
exports.latestEcmaVersion = getLatestEcmaVersion();
exports.name = name;
exports.parse = parse;
exports.supportedEcmaVersions = getSupportedEcmaVersions();
exports.tokenize = tokenize;
exports.version = version;
