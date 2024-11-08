'use strict';

const acorn = require('acorn');
const jsx = require('acorn-jsx');
const visitorKeys = require('eslint-visitor-keys');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { 'default': e };
}

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null);
  if (e) {
    Object.keys(e).forEach((k) => {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : { enumerable: true, get: () => e[k] });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

const acornNamespace = _interopNamespace(acorn);
const jsxDefault = _interopDefaultLegacy(jsx);
const visitorKeysNamespace = _interopNamespace(visitorKeys);

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

function convertTemplatePart(tokens, code) {
  const firstToken = tokens[0],
    lastTemplateToken = tokens.at(-1);

  const token = {
    type: Token.Template,
    value: code.slice(firstToken.start, lastTemplateToken.end)
  };

  if (firstToken.loc) {
    token.loc = {
      start: firstToken.loc.start,
      end: lastTemplateToken.loc.end
    };
  }

  if (firstToken.range) {
    token.start = firstToken.range[0];
    token.end = lastTemplateToken.range[1];
    token.range = [token.start, token.end];
  }

  return token;
}

class TokenTranslator {
  constructor(acornTokTypes, code) {
    this._acornTokTypes = acornTokTypes;
    this._tokens = [];
    this._curlyBrace = null;
    this._code = code;
  }

  translate(token, extra) {
    const type = token.type,
      tt = this._acornTokTypes;

    if (type === tt.name) {
      token.type = Token.Identifier;

      if (token.value === "static") {
        token.type = Token.Keyword;
      }

      if (extra.ecmaVersion > 5 && (token.value === "yield" || token.value === "let")) {
        token.type = Token.Keyword;
      }

    } else if (type === tt.privateId) {
      token.type = Token.PrivateIdentifier;

    } else if (type === tt.semi || type === tt.comma ||
      type === tt.parenL || type === tt.parenR ||
      type === tt.braceL || type === tt.braceR ||
      type === tt.dot || type === tt.bracketL ||
      type === tt.colon || type === tt.question ||
      type === tt.bracketR || type === tt.ellipsis ||
      type === tt.arrow || type === tt.jsxTagStart ||
      type === tt.incDec || type === tt.starstar ||
      type === tt.jsxTagEnd || type === tt.prefix ||
      type === tt.questionDot ||
      (type.binop && !type.keyword) ||
      type.isAssign) {

      token.type = Token.Punctuator;
      token.value = this._code.slice(token.start, token.end);
    } else if (type === tt.jsxName) {
      token.type = Token.JSXIdentifier;
    } else if (type.label === "jsxText" || type === tt.jsxAttrValueToken) {
      token.type = Token.JSXText;
    } else if (type.keyword) {
      if (type.keyword === "true" || type.keyword === "false") {
        token.type = Token.Boolean;
      } else if (type.keyword === "null") {
        token.type = Token.Null;
      } else {
        token.type = Token.Keyword;
      }
    } else if (type === tt.num) {
      token.type = Token.Numeric;
      token.value = this._code.slice(token.start, token.end);
    } else if (type === tt.string) {

      if (extra.jsxAttrValueToken) {
        extra.jsxAttrValueToken = false;
        token.type = Token.JSXText;
      } else {
        token.type = Token.String;
      }

      token.value = this._code.slice(token.start, token.end);
    } else if (type === tt.regexp) {
      token.type = Token.RegularExpression;
      const value = token.value;

      token.regex = {
        flags: value.flags,
        pattern: value.pattern
      };
      token.value = `/${value.pattern}/${value.flags}`;
    }

    return token;
  }

  onToken(token, extra) {
    const tt = this._acornTokTypes,
      tokens = extra.tokens,
      templateTokens = this._tokens;

    const translateTemplateTokens = () => {
      tokens.push(convertTemplatePart(this._tokens, this._code));
      this._tokens = [];
    };

    if (token.type === tt.eof) {

      if (this._curlyBrace) {
        tokens.push(this.translate(this._curlyBrace, extra));
      }

      return;
    }

    if (token.type === tt.backQuote) {

      if (this._curlyBrace) {
        tokens.push(this.translate(this._curlyBrace, extra));
        this._curlyBrace = null;
      }

      templateTokens.push(token);

      if (templateTokens.length > 1) {
        translateTemplateTokens();
      }

      return;
    }
    if (token.type === tt.dollarBraceL) {
      templateTokens.push(token);
      translateTemplateTokens();
      return;
    }
    if (token.type === tt.braceR) {

      if (this._curlyBrace) {
        tokens.push(this.translate(this._curlyBrace, extra));
      }

      this._curlyBrace = token;
      return;
    }
    if (token.type === tt.template || token.type === tt.invalidTemplate) {
      if (this._curlyBrace) {
        templateTokens.push(this._curlyBrace);
        this._curlyBrace = null;
      }

      templateTokens.push(token);
      return;
    }

    if (this._curlyBrace) {
      tokens.push(this.translate(this._curlyBrace, extra));
      this._curlyBrace = null;
    }

    tokens.push(this.translate(token, extra));
  }
}

const SUPPORTED_VERSIONS = [
  3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
];

function getLatestEcmaVersion() {
  return SUPPORTED_VERSIONS.at(-1);
}

function getSupportedEcmaVersions() {
  return [...SUPPORTED_VERSIONS];
}

function normalizeEcmaVersion(ecmaVersion = 5) {

  let version = ecmaVersion === "latest" ? getLatestEcmaVersion() : ecmaVersion;

  if (typeof version !== "number") {
    throw new Error(`ecmaVersion must be a number or "latest". Received value of type ${typeof ecmaVersion} instead.`);
  }

  if (version >= 2015) {
    version -= 2009;
  }

  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new Error("Invalid ecmaVersion.");
  }

  return version;
}

function normalizeSourceType(sourceType = "script") {
  if (sourceType === "script" || sourceType === "module") {
    return sourceType;
  }

  if (sourceType === "commonjs") {
    return "script";
  }

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
    throw new Error("sourceType 'module' is not supported when ecmaVersion < 2015. Consider adding `{ ecmaVersion: 2015 }` to the parser options.");
  }

  return Object.assign({}, options, {
    ecmaVersion,
    sourceType,
    ranges,
    locations,
    allowReserved,
    allowReturnOutsideFunction
  });
}

const STATE = Symbol("espree's internal state");
const ESPRIMA_FINISH_NODE = Symbol("espree's esprimaFinishNode");

function convertAcornCommentToEsprimaComment(block, text, start, end, startLoc, endLoc, code) {
  let type;

  if (block) {
    type = "Block";
  } else if (code.slice(start, start + 2) === "#!") {
    type = "Hashbang";
  } else {
    type = "Line";
  }

  const comment = {
    type,
    value: text
  };

  if (typeof start === "number") {
    comment.start = start;
    comment.end = end;
    comment.range = [start, end];
  }

  if (typeof startLoc === "object") {
    comment.loc = {
      start: startLoc,
      end: endLoc
    };
  }

  return comment;
}

const espree = () => Parser => {
  const tokTypes = Object.assign({}, Parser.acorn.tokTypes);

  if (Parser.acornJsx) {
    Object.assign(tokTypes, Parser.acornJsx.tokTypes);
  }

  return class Espree extends Parser {
    constructor(opts, code) {
      if (typeof opts !== "object" || opts === null) {
        opts = {};
      }
      if (typeof code !== "string" && !(code instanceof String)) {
        code = String(code);
      }

      const originalSourceType = opts.sourceType;
      const options = normalizeOptions(opts);
      const ecmaFeatures = options.ecmaFeatures || {};
      const tokenTranslator = options.tokens === true ? new TokenTranslator(tokTypes, code) : null;

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
        }
      }, code);

      this[STATE] = state;
    }

    tokenize() {
      do {
        this.next();
      } while (this.type !== tokTypes.eof);

      this.next();

      const extra = this[STATE];
      const tokens = extra.tokens;

      if (extra.comments) {
        tokens.comments = extra.comments;
      }

      return tokens;
    }

    finishNode(...args) {
      const result = super.finishNode(...args);
      return this[ESPRIMA_FINISH_NODE](result);
    }

    finishNodeAt(...args) {
      const result = super.finishNodeAt(...args);
      return this[ESPRIMA_FINISH_NODE](result);
    }

    parse() {
      const extra = this[STATE];
      const program = super.parse();

      program.sourceType = extra.originalSourceType;

      if (extra.comments) {
        program.comments = extra.comments;
      }
      if (extra.tokens) {
        program.tokens = extra.tokens;
      }

      if (program.body.length) {
        const [firstNode] = program.body;

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

      this[STATE].templateElements.forEach(templateElement => {
        const startOffset = -1;
        const endOffset = templateElement.tail ? 1 : 2;

        templateElement.start += startOffset;
        templateElement.end += endOffset;

        if (templateElement.range) {
          templateElement.range[0] += startOffset;
          templateElement.range[1] += endOffset;
        }

        if (templateElement.loc) {
          templateElement.loc.start.column += startOffset;
          templateElement.loc.end.column += endOffset;
        }
      });

      return program;
    }

    parseTopLevel(node) {
      if (this[STATE].impliedStrict) {
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
        this[STATE].jsxAttrValueToken = true;
      }
      return result;
    }

    [ESPRIMA_FINISH_NODE](result) {
      if (result.type === "TemplateElement") {
        this[STATE].templateElements.push(result);
      }

      if (result.type.includes("Function") && !result.generator) {
        result.generator = false;
      }

      return result;
    }
  };
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
      this._jsx = acornNamespace.Parser.extend(jsxDefault["default"](), espree());
    }
    return this._jsx;
  },

  get(options) {
    const useJsx = Boolean(
      options &&
      options.ecmaFeatures &&
      options.ecmaFeatures.jsx
    );

    return useJsx ? this.jsx : this.regular;
  }
};

function tokenize(code, options) {
  const Parser = parsers.get(options);

  if (!options || options.tokens !== true) {
    options = Object.assign({}, options, { tokens: true });
  }

  return new Parser(options, code).tokenize();
}

function parse(code, options) {
  const Parser = parsers.get(options);

  return new Parser(options, code).parse();
}

const name = "espree";

/* istanbul ignore next */
const VisitorKeys = (function() {
  return visitorKeysNamespace.KEYS;
}());

const Syntax = (function() {
  let key,
    types = {};

  if (typeof Object.create === "function") {
    types = Object.create(null);
  }

  for (key in VisitorKeys) {
    if (Object.hasOwn(VisitorKeys, key)) {
      types[key] = key;
    }
  }

  if (typeof Object.freeze === "function") {
    Object.freeze(types);
  }

  return types;
}());

const latestEcmaVersion = getLatestEcmaVersion();

const supportedEcmaVersions = getSupportedEcmaVersions();

exports.Syntax = Syntax;
exports.VisitorKeys = VisitorKeys;
exports.latestEcmaVersion = latestEcmaVersion;
exports.name = name;
exports.parse = parse;
exports.supportedEcmaVersions = supportedEcmaVersions;
exports.tokenize = tokenize;
exports.version = version;
