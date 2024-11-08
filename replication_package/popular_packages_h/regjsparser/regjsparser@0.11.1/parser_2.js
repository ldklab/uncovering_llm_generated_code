"use strict";

(function() {
  // Polyfill for `String.fromCodePoint` for compatibility
  var fromCodePoint = String.fromCodePoint || (function() {
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;

    return function fromCodePoint() {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var index = -1;
      var length = arguments.length;
      if (!length) return '';
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) !== codePoint) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        if (codePoint <= 0xFFFF) {
          codeUnits.push(codePoint);
        } else {
          codePoint -= 0x10000;
          var highSurrogate = (codePoint >> 10) + 0xD800;
          var lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 === length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
  }());

  // Main parse function
  function parse(str, flags = "", features = {}) {
    var pos = 0;
    var closedCaptureCounter = 0;
    var firstIteration = true;
    var shouldReparse = false;
    var backrefDenied = [];
    
    const hasUnicodeFlag = flags.includes("u");
    const hasUnicodeSetFlag = flags.includes("v");
    const isUnicodeMode = hasUnicodeFlag || hasUnicodeSetFlag;

    if (hasUnicodeSetFlag && !features.unicodeSet) {
      throw new Error('The "v" flag is only supported when the .unicodeSet option is enabled.');
    }

    if (hasUnicodeFlag && hasUnicodeSetFlag) {
      throw new Error('The "u" and "v" flags are mutually exclusive.');
    }

    str = String(str);
    if (str === '') str = '(?:)';

    // Add raw property to nodes
    function addRaw(node) {
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
    }

    function parseDisjunction() {
      var alternatives = [];
      var from = pos;
      alternatives.push(parseAlternative());

      while (match('|')) {
        alternatives.push(parseAlternative());
      }

      return alternatives.length === 1 ? alternatives[0] : createNode('disjunction', alternatives, from);
    }

    function parseAlternative() {
      var terms = [];
      var from = pos;
      while (let term = parseTerm()) {
        terms.push(term);
      }

      return terms.length === 1 ? terms[0] : createNode('alternative', terms, from);
    }

    function parseTerm() {
      if (pos >= str.length || current('|') || current(')')) return null;

      let term = parseAnchor() || parseAtomAndQuantifier();
      if (!term) bail('Expected term');

      return term;
    }

    function parseAnchor() {
      // Check for different types of anchors
      if (match('^')) return createNode('anchor', 'start', 1);
      if (match('$')) return createNode('anchor', 'end', 1);
      if (match('\\b')) return createNode('anchor', 'boundary', 2);
      if (match('\\B')) return createNode('anchor', 'not-boundary', 2);

      // Lookahead assertions
      return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
    }

    function parseAtomAndQuantifier() {
      let atom = parseAtom();
      if (!atom) bail('Expected atom');

      let quantifier = parseQuantifier() || false;
      if (quantifier) {
        if (shouldNotQuantify(atom)) bail('Invalid quantifier');
        quantifier.body = flattenBody(atom);
        updateRawStart(quantifier, atom.range[0]);
        return quantifier;
      }

      return atom;
    }

    function parseGroup(open, typeA, openNeg, typeB) {
      let type = null;
      let from = pos;
      if (match(open)) type = typeA;
      else if (match(openNeg)) type = typeB;
      else return false;

      let body = parseDisjunction();
      if (!body) bail('Expected disjunction');

      skip(')');
      return createNode('group', flattenBody(body), from, type);
    }

    function parseQuantifier() {
      let from = pos;
      let quantifier;
      if (match('*')) quantifier = createQuantifier(0, undefined, '*', from);
      else if (match('+')) quantifier = createQuantifier(1, undefined, '+', from);
      else if (match('?')) quantifier = createQuantifier(0, 1, '?', from);
      else {
        // Handle other quantifier formats like {n}, {n,}, {n,m}
        let result = matchReg(/^\{(\d+)(,(\d+)?)?\}/);
        if (result) {
          let min = parseInt(result[1], 10);
          let max = result[3] ? parseInt(result[3], 10) : undefined;
          if (max !== undefined && min > max) bail('Quantifier numbers out of order');
          quantifier = createQuantifier(min, max, '', result.range[0]);
        }
      }

      if ((quantifier.min && !Number.isSafeInteger(quantifier.min)) || 
          (quantifier.max && !Number.isSafeInteger(quantifier.max))) {
        bail('Unsafe integer in quantifier');
      }

      if (quantifier && match('?')) {
        quantifier.greedy = false;
        quantifier.range[1] += 1;
      }

      return quantifier;
    }

    // Parse functions for different regex components
    function parseAtom() {
      // Handle various atom types (character, dot, escape, etc.)
      if (let res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) return createCharacter(res);

      if (match('.')) return createNode('dot', '', pos - 1);
      if (match('\\')) return parseAtomEscapeOrExtended();
      if (let res = parseCharacterClass()) return res;

      // Named groups and lookbehind features
      if (features.namedGroups && match('(?<')) {
        let name = parseIdentifier();
        skip('>');
        let group = finishGroup('normal', name.range[0] - 3, 'normal');
        group.name = name;
        return group;
      }

      return parseGroup('(?:', 'ignore', '(', 'normal');
    }

    function parseCharacterClass() {
      // Handle character classes and build class contents
      let from = pos;
      if (match('[^')) {
        let contents = parseClassContents();
        skip(']');
        return createNode('characterClass', contents, from, true);
      } else if (match('[')) {
        let contents = parseClassContents();
        skip(']');
        return createNode('characterClass', contents, from, false);
      }
      return null;
    }

    function parseClassContents() {
      if (current(']')) return { kind: 'union', body: [] };
      else if (hasUnicodeSetFlag) return parseClassSetExpression();
      else return parseNonemptyClassRanges() || bail('Expected class ranges');
    }

    function parseNonemptyClassRanges() {
      let atom = parseClassAtom();
      if (!atom) bail('Expected class atom');
      if (current(']')) return [atom];
      return parseHelperClassContents(atom);
    }

    // Utility functions for parsing
    function match(value) {
      if (str.indexOf(value, pos) === pos) return incr(value.length);
    }

    function lookahead() {
      return str[pos];
    }

    function current(value) {
      return str.indexOf(value, pos) === pos;
    }

    function next(value) {
      return str[pos + 1] === value;
    }

    function matchReg(regExp) {
      let subStr = str.substring(pos);
      let res = subStr.match(regExp);
      if (res) {
        res.range = [pos, pos += res[0].length];
      }
      return res;
    }

    function incr(amount = 1) {
      let res = str.substring(pos, pos + amount);
      pos += amount;
      return res;
    }

    function skip(value) {
      if (!match(value)) bail('Expected character ' + value);
    }

    function bail(message, details = '', from = pos, to = from) {
      let contextStart = Math.max(0, from - 10);
      let contextEnd = Math.min(to + 10, str.length);
      let context = '    ' + str.substring(contextStart, contextEnd);
      let pointer = '    ' + new Array(from - contextStart + 1).join(' ') + '^';

      throw SyntaxError(`${message} at position ${from}${details ? ': ' + details : ''}\n${context}\n${pointer}`);
    }

    // Create syntax node for AST
    function createNode(type, body, from, additional = null) {
      let node = {
        type,
        body,
        range: [from, pos]
      };
      if (additional != null) {
        node.additional = additional;
      }
      return addRaw(node);
    }

    function createCharacter(matches) {
      let char = matches[0];
      let codePoint = isUnicodeMode ? fromCodePoint(char.charCodeAt(0)) : char.charCodeAt(0);
      return createNode('symbol', codePoint, pos - matches.length);
    }

    function createQuantifier(min, max, symbol, from) {
      return createNode('quantifier', {
        min: min,
        max: max,
        greedy: true
      }, from, symbol);
    }

    function flattenBody(body) {
      if (body.type === 'alternative') return body.body;
      else return [body];
    }

    function shouldNotQuantify(term) {
      return term.type === "group" && ["negativeLookbehind", "lookbehind", "negativeLookahead", "lookahead"].includes(term.behavior);
    }

    // Final parsing steps and entry point
    let result = parseDisjunction();

    if (result.range[1] !== str.length) bail('Stuck at character');

    shouldReparse = shouldReparse || backrefDenied.some(ref => ref <= closedCaptureCounter);

    if (shouldReparse) {
      pos = 0;
      firstIteration = false;
      return parseDisjunction();
    }

    return result;
  }

  var regjsparser = {
    parse
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }

}());
