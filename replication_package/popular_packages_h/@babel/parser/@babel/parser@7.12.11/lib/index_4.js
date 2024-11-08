'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class TokenType {
  constructor(label, conf = {}) {
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.rightAssociative = !!conf.rightAssociative;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop != null ? conf.binop : null;
    this.updateContext = null;
  }
}

const keywords = new Map();

function createKeyword(name, options = {}) {
  options.keyword = name;
  const token = new TokenType(name, options);
  keywords.set(name, token);
  return token;
}

function createBinop(name, binop) {
  return new TokenType(name, {
    beforeExpr: true,
    binop,
  });
}

const types = {
  num: new TokenType("num", { startsExpr: true }),
  bigint: new TokenType("bigint", { startsExpr: true }),
  decimal: new TokenType("decimal", { startsExpr: true }),
  regexp: new TokenType("regexp", { startsExpr: true }),
  string: new TokenType("string", { startsExpr: true }),
  name: new TokenType("name", { startsExpr: true }),
  eof: new TokenType("eof"),
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketHashL: new TokenType("#[", { beforeExpr: true, startsExpr: true }),
  bracketBarL: new TokenType("[|", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  bracketBarR: new TokenType("|]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceBarL: new TokenType("{|", { beforeExpr: true, startsExpr: true }),
  braceHashL: new TokenType("#{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  braceBarR: new TokenType("|}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", { beforeExpr: true }),
  semi: new TokenType(";", { beforeExpr: true }),
  colon: new TokenType(":", { beforeExpr: true }),
  doubleColon: new TokenType("::", { beforeExpr: true }),
  dot: new TokenType("."),
  question: new TokenType("?", { beforeExpr: true }),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", { beforeExpr: true }),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", { beforeExpr: true }),
  backQuote: new TokenType("`", { startsExpr: true }),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
  at: new TokenType("@"),
  hash: new TokenType("#", { startsExpr: true }),
  interpreterDirective: new TokenType("#!..."),
  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  bang: new TokenType("!", { beforeExpr: true, prefix: true, startsExpr: true }),
  tilde: new TokenType("~", { beforeExpr: true, prefix: true, startsExpr: true }),
  pipeline: createBinop("|>", 0),
  nullishCoalescing: createBinop("??", 1),
  logicalOR: createBinop("||", 1),
  logicalAND: createBinop("&&", 2),
  bitwiseOR: createBinop("|", 3),
  bitwiseXOR: createBinop("^", 4),
  bitwiseAND: createBinop("&", 5),
  equality: createBinop("==/!=/===/!==", 6),
  relational: createBinop("</>/<=/>=", 7),
  bitShift: createBinop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: new TokenType("%", { beforeExpr: true, binop: 10, startsExpr: true }),
  star: new TokenType("*", { binop: 10 }),
  slash: createBinop("/", 10),
  exponent: new TokenType("**", { beforeExpr: true, binop: 11, rightAssociative: true }),
  _break: createKeyword("break"),
  _case: createKeyword("case", { beforeExpr: true }),
  _catch: createKeyword("catch"),
  _continue: createKeyword("continue"),
  _debugger: createKeyword("debugger"),
  _default: createKeyword("default", { beforeExpr: true }),
  _do: createKeyword("do", { isLoop: true, beforeExpr: true }),
  _else: createKeyword("else", { beforeExpr: true }),
  _finally: createKeyword("finally"),
  _for: createKeyword("for", { isLoop: true }),
  _function: createKeyword("function", { startsExpr: true }),
  _if: createKeyword("if"),
  _return: createKeyword("return", { beforeExpr: true }),
  _switch: createKeyword("switch"),
  _throw: createKeyword("throw", { beforeExpr: true, prefix: true, startsExpr: true }),
  _try: createKeyword("try"),
  _var: createKeyword("var"),
  _const: createKeyword("const"),
  _while: createKeyword("while", { isLoop: true }),
  _with: createKeyword("with"),
  _new: createKeyword("new", { beforeExpr: true, startsExpr: true }),
  _this: createKeyword("this", { startsExpr: true }),
  _super: createKeyword("super", { startsExpr: true }),
  _class: createKeyword("class", { startsExpr: true }),
  _extends: createKeyword("extends", { beforeExpr: true }),
  _export: createKeyword("export"),
  _import: createKeyword("import", { startsExpr: true }),
  _null: createKeyword("null", { startsExpr: true }),
  _true: createKeyword("true", { startsExpr: true }),
  _false: createKeyword("false", { startsExpr: true }),
  _in: createKeyword("in", { beforeExpr: true, binop: 7 }),
  _instanceof: createKeyword("instanceof", { beforeExpr: true, binop: 7 }),
  _typeof: createKeyword("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
  _void: createKeyword("void", { beforeExpr: true, prefix: true, startsExpr: true }),
  _delete: createKeyword("delete", { beforeExpr: true, prefix: true, startsExpr: true }),
};

const lineBreak = /\r\n?|[\n\u2028\u2029]/;
const lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code) {
  switch (code) {
    case 10:
    case 13:
    case 8232:
    case 8233:
      return true;

    default:
      return false;
  }
}
const skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
function isWhitespace(code) {
  switch (code) {
    case 0x0009:
    case 0x000b:
    case 0x000c:
    case 32:
    case 160:
    case 5760:
    case 0x2000:
    case 0x2001:
    case 0x2002:
    case 0x2003:
    case 0x2004:
    case 0x2005:
    case 0x2006:
    case 0x2007:
    case 0x2008:
    case 0x2009:
    case 0x200a:
    case 0x202f:
    case 0x205f:
    case 0x3000:
    case 0xfeff:
      return true;

    default:
      return false;
  }
}

class Position {
  constructor(line, col) {
    this.line = line;
    this.column = col;
  }
}

class SourceLocation {
  constructor(start, end) {
    this.start = start;
    this.end = end;
    this.filename = null;
    this.identifierName = null;
  }
}

function getLineInfo(input, offset) {
  let line = 1;
  let lineStart = 0;
  let match;
  lineBreakG.lastIndex = 0;

  while ((match = lineBreakG.exec(input)) && match.index < offset) {
    line++;
    lineStart = lineBreakG.lastIndex;
  }

  return new Position(line, offset - lineStart);
}

class BaseParser {
  constructor() {
    this.sawUnambiguousESM = false;
    this.ambiguousScriptDifferentAst = false;
  }

  hasPlugin(name) {
    return false;
  }

  getPluginOption(plugin, name) {
    return null;
  }
}

function last(stack) {
  return stack[stack.length - 1];
}

class CommentsParser extends BaseParser {
  addComment(comment) {
    // Add comments to the state
  }

  adjustCommentsAfterTrailingComma(node, elements, takeAllComments) {
    // Adjust code comments for elements
  }

  processComment(node) {
    // Process and attach comments to node
  }
}

const ErrorMessages = Object.freeze({
  AccessorIsGenerator: "A %0ter cannot be a generator",
  // .... Other error messages
});

class ParserError extends CommentsParser {
  getLocationForPosition(pos) {
    let loc;
    if (pos === this.state.start) loc = this.state.startLoc;
    else if (pos === this.state.lastTokStart) loc = this.state.lastTokStartLoc;
    else if (pos === this.state.end) loc = this.state.endLoc;
    else if (pos === this.state.lastTokEnd) loc = this.state.lastTokEndLoc;
    else loc = getLineInfo(this.input, pos);

    return loc;
  }

  raise(pos, errorTemplate, ...params) {
    return this.raiseWithData(pos, undefined, errorTemplate, ...params);
  }

  raiseWithData(pos, data, errorTemplate, ...params) {
    const loc = this.getLocationForPosition(pos);
    const message = errorTemplate.replace(/%(\d+)/g, (_, i) => params[i]) + ` (${loc.line}:${loc.column})`;
    return this._raise({ loc, pos, ...data }, message);
  }

  _raise(errorContext, message) {
    const err = new SyntaxError(message);
    Object.assign(err, errorContext);

    if (this.options.errorRecovery) {
      if (!this.isLookahead) this.state.errors.push(err);
      return err;
    } else {
      throw err;
    }
  }
}

// More implementation for the parser...

exports.parse = function parse(input, options) {
  const parser = new ParserError();
  parser.parse(input, options);
};

exports.tokenTypes = types;
