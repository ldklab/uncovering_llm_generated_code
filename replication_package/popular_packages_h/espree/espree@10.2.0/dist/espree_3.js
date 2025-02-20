'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const acorn = require('acorn');
const jsx = require('acorn-jsx');
const visitorKeys = require('eslint-visitor-keys');

/**
 * Provides a mechanism to safely import various modules to ensure compatibility.
 * @param {object} module The module to be wrapped.
 * @returns {object} A safely wrapped module object.
 */
function _interopDefaultLegacy(module) {
  return module && typeof module === 'object' && 'default' in module ? module : { default: module };
}

/**
 * Safely converts a module to a namespace object.
 * @param {object} module The module to be converted.
 * @returns {object} The converted namespace object.
 */
function _interopNamespace(module) {
  if (module && module.__esModule) return module;
  const namespace = Object.create(null);
  if (module) {
    Object.keys(module).forEach((key) => {
      if (key !== 'default') {
        const descriptor = Object.getOwnPropertyDescriptor(module, key);
        Object.defineProperty(namespace, key, descriptor.get ? descriptor : {
          enumerable: true,
          get: () => module[key],
        });
      }
    });
  }
  namespace.default = module;
  return Object.freeze(namespace);
}

const acornNamespace = _interopNamespace(acorn);
const jsxDefault = _interopDefaultLegacy(jsx);
const visitorKeysNamespace = _interopNamespace(visitorKeys);

// Enum for token types
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
  JSXText: "JSXText",
};

/**
 * Converts Acorn template tokens to Esprima tokens.
 * @param {Array} tokens Acorn tokens representing a template.
 * @param {string} code Source code corresponding to the tokens.
 * @returns {object} A token object formatted as per the Esprima specifications.
 * @private
 */
function convertTemplatePart(tokens, code) {
  const firstToken = tokens[0];
  const lastToken = tokens[tokens.length - 1];
  const token = {
    type: Token.Template,
    value: code.slice(firstToken.start, lastToken.end),
  };

  if (firstToken.loc) {
    token.loc = {
      start: firstToken.loc.start,
      end: lastToken.loc.end,
    };
  }

  if (firstToken.range) {
    token.start = firstToken.range[0];
    token.end = lastToken.range[1];
    token.range = [token.start, token.end];
  }

  return token;
}

/**
 * TokenTranslator class to handle translation of Acorn tokens to Esprima tokens.
 */
class TokenTranslator {
  /**
   * Initializes a new instance of the TokenTranslator class.
   * @param {object} acornTokTypes The Acorn token types.
   * @param {string} code The source code being parsed.
   */
  constructor(acornTokTypes, code) {
    this._acornTokTypes = acornTokTypes;
    this._tokens = [];
    this._curlyBrace = null;
    this._code = code;
  }

  /**
   * Translates a single Acorn token to an Esprima token.
   * @param {object} token The Acorn token.
   * @param {object} extra Additional translation context.
   * @returns {object} The Esprima-style token.
   */
  translate(token, extra) {
    const type = token.type;
    const tt = this._acornTokTypes;

    switch (type) {
      case tt.name:
        token.type = Token.Identifier;
        if (['static', 'yield', 'let'].includes(token.value)) {
          token.type = Token.Keyword;
        }
        break;
      case tt.privateId:
        token.type = Token.PrivateIdentifier;
        break;
      case tt.semi:
      case tt.comma:
      case tt.parenL:
      case tt.parenR:
      case tt.braceL:
      case tt.braceR:
      case tt.dot:
      case tt.bracketL:
      case tt.colon:
      case tt.question:
      case tt.bracketR:
      case tt.ellipsis:
      case tt.arrow:
      case tt.jsxTagStart:
      case tt.incDec:
      case tt.starstar:
      case tt.jsxTagEnd:
      case tt.prefix:
      case tt.questionDot:
      case type.binop && !type.keyword:
      case type.isAssign:
        token.type = Token.Punctuator;
        token.value = this._code.slice(token.start, token.end);
        break;
      case tt.jsxName:
        token.type = Token.JSXIdentifier;
        break;
      case tt.jsxAttrValueToken:
      case tt.template:
      case tt.invalidTemplate:
        token.type = Token.JSXText;
        break;
      case tt.num:
        token.type = Token.Numeric;
        token.value = this._code.slice(token.start, token.end);
        break;
      case tt.string:
        token.type = extra.jsxAttrValueToken ? Token.JSXText : Token.String;
        token.value = this._code.slice(token.start, token.end);
        extra.jsxAttrValueToken = false;
        break;
      case tt.regexp:
        token.type = Token.RegularExpression;
        token.regex = {
          flags: token.value.flags,
          pattern: token.value.pattern,
        };
        token.value = `/${token.value.pattern}/${token.value.flags}`;
        break;
      default:
        if (type.keyword) {
          token.type = type.keyword === 'true' || type.keyword === 'false' ? Token.Boolean : Token.Keyword;
        }
    }
    return token;
  }

  /**
   * Processes a token from Acorn during the parsing.
   * @param {object} token The Acorn token.
   * @param {object} extra Additional translation context.
   */
  onToken(token, extra) {
    const tt = this._acornTokTypes;

    const translateTemplateTokens = () => {
      extra.tokens.push(convertTemplatePart(this._tokens, this._code));
      this._tokens = [];
    };

    if (token.type === tt.eof) {
      if (this._curlyBrace) {
        extra.tokens.push(this.translate(this._curlyBrace, extra));
      }
      return;
    }

    if (token.type === tt.backQuote) {
      if (this._curlyBrace) {
        extra.tokens.push(this.translate(this._curlyBrace, extra));
        this._curlyBrace = null;
      }
      this._tokens.push(token);

      if (this._tokens.length > 1) {
        translateTemplateTokens();
      }
      return;
    }

    if (token.type === tt.dollarBraceL) {
      this._tokens.push(token);
      translateTemplateTokens();
      return;
    }

    if (token.type === tt.braceR) {
      if (this._curlyBrace) {
        extra.tokens.push(this.translate(this._curlyBrace, extra));
      }
      this._curlyBrace = token;
      return;
    }

    if (['template', 'invalidTemplate'].includes(token.type.label)) {
      if (this._curlyBrace) {
        this._tokens.push(this._curlyBrace);
        this._curlyBrace = null;
      }
      this._tokens.push(token);
      return;
    }

    if (this._curlyBrace) {
      extra.tokens.push(this.translate(this._curlyBrace, extra));
      this._curlyBrace = null;
    }
    extra.tokens.push(this.translate(token, extra));
  }
}

const SUPPORTED_ECMASCRIPT_VERSIONS = [
  3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
];

/**
 * @returns {number} Latest ECMAScript version supported.
 */
function getLatestEcmaVersion() {
  return SUPPORTED_ECMASCRIPT_VERSIONS.slice(-1)[0];
}

/**
 * @returns {number[]} Supported ECMAScript versions.
 */
function getSupportedEcmaVersions() {
  return [...SUPPORTED_ECMASCRIPT_VERSIONS];
}

/**
 * Normalizes ECMAScript version to supported form.
 * @param {(number|string)} ecmaVersion ECMAScript version from config.
 * @throws {Error} If version is invalid.
 * @returns {number} Normalized ECMAScript version.
 */
function normalizeEcmaVersion(ecmaVersion = 5) {
  let version = ecmaVersion === 'latest' ? getLatestEcmaVersion() : ecmaVersion;

  if (typeof version !== 'number') {
    throw new Error(`ecmaVersion must be a number or "latest". Received: ${typeof ecmaVersion}`);
  }

  if (version >= 2015) {
    version -= 2009;
  }

  if (!SUPPORTED_ECMASCRIPT_VERSIONS.includes(version)) {
    throw new Error("Invalid ecmaVersion.");
  }

  return version;
}

/**
 * Normalizes the source type from the configuration.
 * @param {string} sourceType The source type, defaults to "script".
 * @throws {Error} If the source type is invalid.
 * @returns {string} The normalized source type.
 */
function normalizeSourceType(sourceType = "script") {
  if (["script", "module"].includes(sourceType)) {
    return sourceType;
  }

  if (sourceType === "commonjs") {
    return "script";
  }

  throw new Error("Invalid sourceType.");
}

/**
 * Normalize the parser options from configuration.
 * @param {object} options The parser options.
 * @throws {Error} If any option is invalid.
 * @returns {object} The normalized options.
 */
function normalizeOptions(options) {
  const ecmaVersion = normalizeEcmaVersion(options.ecmaVersion);
  const sourceType = normalizeSourceType(options.sourceType);
  const ranges = options.range === true;
  const locations = options.loc === true;

  if (ecmaVersion !== 3 && options.allowReserved) {
    throw new Error("`allowReserved` is only supported when ecmaVersion is 3");
  }

  if (options.allowReserved !== undefined && typeof options.allowReserved !== "boolean") {
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

/**
 * Converts Acorn comment to an Esprima comment object.
 * @param {boolean} block True if block comment, else line comment.
 * @param {string} text Comment text.
 * @param {number} start Starting position.
 * @param {number} end Ending position.
 * @param {object} startLoc Start location object.
 * @param {object} endLoc End location object.
 * @param {string} code The source code.
 * @returns {object} The Esprima comment object.
 */
function convertAcornCommentToEsprimaComment(block, text, start, end, startLoc, endLoc, code) {
  let type = block ? "Block" : "Line";
  if (!block && code.slice(start, start + 2) === "#!") {
    type = "Hashbang";
  }

  const comment = {
    type,
    value: text,
  };

  if (typeof start === 'number') {
    comment.start = start;
    comment.end = end;
    comment.range = [start, end];
  }

  if (startLoc) {
    comment.loc = {
      start: startLoc,
      end: endLoc,
    };
  }

  return comment;
}

/**
 * Extends the default Parser with additional functionality.
 * @param {object} Parser The default acorn parser to extend.
 * @returns {object} The extended parser class.
 */
const espree = () => (Parser) => {
  const tokTypes = { ...Parser.acorn.tokTypes };

  if (Parser.acornJsx) {
    Object.assign(tokTypes, Parser.acornJsx.tokTypes);
  }

  class Espree extends Parser {
    constructor(opts, code) {
      opts = opts || {};
      code = typeof code !== "string" && !(code instanceof String) ? String(code) : code;

      const originalSourceType = opts.sourceType;
      const options = normalizeOptions(opts);
      const ecmaFeatures = options.ecmaFeatures || {};

      const tokenTranslator = options.tokens ? new TokenTranslator(tokTypes, code) : null;

      const state = {
        originalSourceType: originalSourceType || options.sourceType,
        tokens: tokenTranslator ? [] : null,
        comments: options.comment ? [] : null,
        impliedStrict: ecmaFeatures.impliedStrict && options.ecmaVersion >= 5,
        ecmaVersion: options.ecmaVersion,
        jsxAttrValueToken: false,
        lastToken: null,
        templateElements: [],
      };

      super({
        ecmaVersion: options.ecmaVersion,
        sourceType: options.sourceType,
        ranges: options.ranges,
        locations: options.locations,
        allowReserved: options.allowReserved,
        allowReturnOutsideFunction: options.allowReturnOutsideFunction,

        onToken(token) {
          if (tokenTranslator) {
            tokenTranslator.onToken(token, state);
          }
          if (token.type !== tokTypes.eof) {
            state.lastToken = token;
          }
        },

        onComment(block, text, start, end, startLoc, endLoc) {
          if (state.comments) {
            const comment = convertAcornCommentToEsprimaComment(block, text, start, end, startLoc, endLoc, code);
            state.comments.push(comment);
          }
        },
      }, code);

      this[Symbol("internalState")] = state;
    }

    tokenize() {
      do {
        this.next();
      } while (this.type !== tokTypes.eof);

      this.next();
      const { tokens, comments } = this[Symbol("internalState")];
      if (comments) {
        tokens.comments = comments;
      }
      return tokens;
    }

    finishNode(...args) {
      const result = super.finishNode(...args);
      return this[Symbol("esprimaFinishNode")](result);
    }

    finishNodeAt(...args) {
      const result = super.finishNodeAt(...args);
      return this[Symbol("esprimaFinishNode")](result);
    }

    parse() {
      const state = this[Symbol("internalState")];
      const program = super.parse();
      program.sourceType = state.originalSourceType;

      if (state.comments) {
        program.comments = state.comments;
      }
      if (state.tokens) {
        program.tokens = state.tokens;
      }

      if (program.body.length) {
        const firstNode = program.body[0];
        if (program.range) {
          program.range[0] = firstNode.range[0];
        }
        if (program.loc) {
          program.loc.start = firstNode.loc.start;
        }
      }

      if (state.lastToken) {
        if (program.range) {
          program.range[1] = state.lastToken.range[1];
        }
        if (program.loc) {
          program.loc.end = state.lastToken.loc.end;
        }
      }

      state.templateElements.forEach((element) => {
        element.start -= 1;
        element.end += element.tail ? 1 : 2;
        if (element.range) {
          element.range[0] -= 1;
          element.range[1] += element.tail ? 1 : 2;
        }
      });

      return program;
    }

    parseTopLevel(node) {
      if (this[Symbol("internalState")].impliedStrict) {
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
      let message = 'Unexpected token';
      if (pos !== null && pos !== undefined) {
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
        this[Symbol("internalState")].jsxAttrValueToken = true;
      }
      return result;
    }

    [Symbol("esprimaFinishNode")](node) {
      if (node.type === "TemplateElement") {
        this[Symbol("internalState")].templateElements.push(node);
      }
      if (node.type.includes("Function") && !node.generator) {
        node.generator = false;
      }
      return node;
    }
  }
  return Espree;
};

const version = "10.2.0";

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
      this._jsx = acornNamespace.Parser.extend(jsxDefault(), espree());
    }
    return this._jsx;
  },

  get(options) {
    const useJsx = Boolean(options && options.ecmaFeatures && options.ecmaFeatures.jsx);
    return useJsx ? this.jsx : this.regular;
  },
};

/**
 * Tokenizes the given code.
 * @param {string} code The code to tokenize.
 * @param {object} options Options defining how to tokenize.
 * @returns {array} An array of tokens.
 * @throws {SyntaxError} If the input code is invalid.
 */
function tokenize(code, options) {
  const Parser = parsers.get(options);
  if (!options || options.tokens !== true) {
    options = { ...options, tokens: true };
  }
  return new Parser(options, code).tokenize();
}

/**
 * Parses the given code.
 * @param {string} code The code to parse.
 * @param {object} options Options defining how to parse.
 * @returns {object} The "Program" AST node.
 * @throws {SyntaxError} If the input code is invalid.
 */
function parse(code, options) {
  const Parser = parsers.get(options);
  return new Parser(options, code).parse();
}

const latestEcmaVersion = getLatestEcmaVersion();
const supportedEcmaVersions = getSupportedEcmaVersions();

const VisitorKeys = ((() => {
  return visitorKeysNamespace.KEYS;
})());

const Syntax = ((() => {
  const types = Object.create(null);
  for (const key in VisitorKeys) {
    if (VisitorKeys.hasOwnProperty(key)) {
      types[key] = key;
    }
  }
  return Object.freeze(types);
})());

const name = "espree";

exports.Syntax = Syntax;
exports.VisitorKeys = VisitorKeys;
exports.latestEcmaVersion = latestEcmaVersion;
exports.name = name;
exports.parse = parse;
exports.supportedEcmaVersions = supportedEcmaVersions;
exports.tokenize = tokenize;
exports.version = version;
