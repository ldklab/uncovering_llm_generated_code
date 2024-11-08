(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.acorn = {}));
})(this, (function (exports) {
  'use strict';

  // Code for managing tokens and contexts
  var TokenType = function TokenType(label, conf) {
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // Acorn Parser definition
  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.input = String(input);
    // Initialize tokenizer state
    this.initTokenState(startPos);
    // Initialize parser state
    this.initParserState();
  };

  Parser.prototype.initParserState = function() {
    // Initializes parser state variables
    this.type = types.eof;
    this.value = null;
    this.start = this.end = this.pos;
    this.startLoc = this.endLoc = this.curPosition();
  };

  // Tokenization and Parsing Functions
  Parser.prototype.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }
    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.nextToken();
  };

  Parser.prototype.nextToken = function() {
    this.skipSpace();
    this.start = this.pos;
    this.readToken(this.fullCharCodeAtPos());
  };

  Parser.prototype.readToken = function(code) {
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }
    return this.getTokenFromCode(code)
  };

  // Helper functions for Unicode, Keywords, Identifiers, etc.
  Parser.acorn = {
    Parser: Parser,
    version: version,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
  };

  // Expose parsing functionalities
  function parse(input, options) {
    return Parser.parse(input, options);
  }

  // Export tokens and utility functions
  exports.Parser = Parser;
  exports.parse = parse;

}));
