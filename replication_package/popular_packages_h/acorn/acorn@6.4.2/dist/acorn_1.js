(function (global, factory) {
  // Check if the environment is Node.js with CommonJS module.
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } 
  // Check if the environment supports AMD modules.
  else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } 
  // Otherwise, assume a browser environment and attach to a global object.
  else {
    global = global || self;
    factory(global.acorn = {});
  }
}(this, (function (exports) { 
  'use strict';

  // Define reserved words for various ECMAScript versions.
  const reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // Define keywords for ECMAScript 5 and below, and newer versions.
  const ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
  const keywords = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  // Define regular expressions for character categories.
  const nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4...";
  const nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487...";
  const nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  const nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // Check if a given character code starts an identifier.
  function isIdentifierStart(code, astral) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
    if (astral === false) return false;
    return isInAstralSet(code, astralIdentifierStartCodes);
  }

  // Define token types and construct token objects.
  const TokenType = function (label, conf = {}) {
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

  function binop(name, prec) {
    return new TokenType(name, { beforeExpr: true, binop: prec });
  }

  // Define Parser class and prototype functions for parsing.
  const Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.input = String(input);
    this.startLoc = this.options.locations ? this.curPosition() : null;
  };

  // Define function for parsing and handling syntax.
  Parser.prototype.parse = function () {
    const node = this.startNode();
    this.nextToken();
    return this.parseTopLevel(node);
  };

  // Define other utility functions and objects required for parsing.
  function getOptions(opts) {
    const options = {};
    for (const opt in defaultOptions) {
      options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
    }
    return options;
  }

  // Add more utility functions to handle parsing tokens, source code location, etc.

  // Expose parsing functionalities as a module.
  exports.parse = function (input, options) {
    return Parser.parse(input, options);
  };

  // Define the default options and parser-specific error handlers.
  const defaultOptions = {
    ecmaVersion: 9,
    sourceType: "script",
    allowReserved: null,
    strict: false,
    locations: false,
    ranges: false
  };

})));
