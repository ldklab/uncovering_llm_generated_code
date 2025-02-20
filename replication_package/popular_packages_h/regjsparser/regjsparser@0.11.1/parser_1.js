"use strict";

(function() {
  const fromCodePoint = String.fromCodePoint || function(...codePoints) {
    const stringFromCharCode = String.fromCharCode;
    const MAX_SIZE = 0x4000;
    let res = '', codeUnits = [];
    
    for (let codePoint of codePoints) {
      if (
        !Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF ||
        Math.floor(codePoint) !== codePoint
      ) {
        throw RangeError(`Invalid code point: ${codePoint}`);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        codeUnits.push((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
      }
      if (codeUnits.length > MAX_SIZE) {
        res += stringFromCharCode(...codeUnits);
        codeUnits.length = 0;
      }
    }
    return res + stringFromCharCode(...codeUnits);
  };

  const parse = (str, flags='', features={}) => {
    let pos = 0, closedCaptureCounter = 0, firstIteration = true, shouldReparse = false;
    const hasUnicodeFlag = flags.includes('u');
    const hasUnicodeSetFlag = flags.includes('v');
    const isUnicodeMode = hasUnicodeFlag || hasUnicodeSetFlag;

    if (hasUnicodeSetFlag && !features.unicodeSet) {
      throw new Error('The "v" flag is only supported when the .unicodeSet option is enabled.');
    }
    if (hasUnicodeFlag && hasUnicodeSetFlag) {
      throw new Error('The "u" and "v" flags are mutually exclusive.');
    }

    str = String(str || '(?:)');
    
    function addRaw(node) {
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
    }

    function createAnchor(kind, rawLength) {
      return addRaw({ type: 'anchor', kind, range: [pos - rawLength, pos] });
    }

    function createValue(kind, codePoint, from, to) {
      return addRaw({ type: 'value', kind, codePoint, range: [from, to] });
    }

    function createGroup(behavior, disjunction, from, to) {
      return addRaw({ type: 'group', behavior, body: disjunction, range: [from, to] });
    }

    function createQuantifier(min, max, from, to, symbol) {
      return addRaw({
        type: 'quantifier', min, max, greedy: true, body: null, symbol,
        range: [from || pos - 1, to || pos]
      });
    }

    function bail(message, details, from = pos, to = from) {
      const contextStart = Math.max(0, from - 10);
      const contextEnd = Math.min(to + 10, str.length);
      const context = `    ${str.substring(contextStart, contextEnd)}`;
      const pointer = `    ${' '.repeat(from - contextStart)}^`;

      throw new SyntaxError(`${message} at position ${from}${details ? `: ${details}` : ''}\n${context}\n${pointer}`);
    }

    function parseDisjunction() {
      const alternatives = [];
      do {
        alternatives.push(parseAlternative());
      } while (str[pos] === '|');
      return alternatives.length === 1 ? alternatives[0] : { type: 'disjunction', body: alternatives };
    }

    function parseAlternative() {
      const terms = [];
      while (true) {
        const term = parseTerm();
        if (!term) break;
        terms.push(term);
      }
      return terms.length === 1 ? terms[0] : { type: 'alternative', body: terms };
    }

    function parseTerm() {
      if (str[pos] === '|') return null;
      const parsed = parseAnchor() || parseAtomAndQuantifier();
      return parsed || (bail('Expected term'), null);
    }

    function parseAnchor() {
      if (str[pos] === '^' || str[pos] === '$' || str[pos] === '\\') {
        if (str[pos] === '^') return createAnchor('start', 1);
        if (str[pos] === '$') return createAnchor('end', 1);
        pos++;
        if (str[pos - 1] === 'b') return createAnchor('boundary', 2);
        if (str[pos - 1] === 'B') return createAnchor('not-boundary', 2);
        if (str[pos - 1] === 'k' && features.namedGroups) return parseNamedReference();
      }
      if (str.slice(pos, pos+2) === '(?') {
        const kind = str[pos+2];
        if (kind === '=' || kind === '!') return createGroup(kind === '=' ? 'lookahead' : 'negativeLookahead');
      }
      return null;
    }

    function parseAtomAndQuantifier() {
      // Simple Atom with optional quantifier
      const atom = parseAtom();
      if (!atom) return null;
      const quantifier = parseQuantifier();
      if (quantifier) {
        quantifier.body = atom;
        return quantifier;
      }
      return atom;
    }

    function parseAtom() {
      let char = str[pos];
      if (char === '.') return createValue('dot', 0, pos++, pos);
      if (char === '\\') {
        pos++;
        return parseEscapeSequence();
      }
      if (char === '(') return parseGroup();
      return createValue('character', str.charCodeAt(pos++), pos-1, pos);
    }

    function parseQuantifier() {
      // Match quantifiers *, +, ?, {n}, {n,}, {n,m}
      const char = str[pos];
      let quantifier;
      if (char === '*' || char === '+' || char === '?') {
        quantifier = createQuantifier(char === '+' ? 1 : 0, char === '?' ? 1 : undefined, pos, ++pos, char);
      } else if (char === '{') {
        const match = str.slice(pos).match(/^{(\d+)(?:,(\d*))?}/);
        if (match) {
          const [, min, max] = match.map(Number);
          if (max != null && max < min) bail('Quantifier out of order');
          quantifier = createQuantifier(min, max, pos, pos + match[0].length, match[0]);
          pos += match[0].length;
        }
      }
      if (quantifier && str[pos] === '?') quantifier.greedy = false, pos++;
      return quantifier;
    }

    function parseGroup() {
      // Match groups (normal, non-capturing) and handle lookahead/behind assertions
      const start = pos++;
      const isNonCapturing = str[pos] === '?' && str[pos+1] === ':';
      if (isNonCapturing) pos += 2;
      const subPattern = parseDisjunction();
      if (str[pos] !== ')') bail('Unterminated group');
      pos++;
      return createGroup(isNonCapturing ? 'ignore' : 'normal', subPattern, start, pos);
    }

    function parseEscapeSequence() {
      const kind = str[pos];
      switch(kind) {
        case 'd': case 's': case 'w':  // Character class escapes
        case 'D': case 'S': case 'W':
          return createValue('characterClassEscape', kind, pos++, pos);
        case 't': case 'n': case 'r': case 'f':
          // Other simple escapes
          const escapeValues = { t: 9, n: 10, r: 13, f: 12 };
          return createValue('escape', escapeValues[kind], pos++, pos);
        default:
          // Octal, hex, or unicode escapes are not implemented in this short version
          return createValue('identifier', str.charCodeAt(pos++), pos-1, pos);
      }
    }

    function parseNamedReference() {
      if (str[pos] !== '<') bail('Invalid named reference');
      let end = str.indexOf('>', pos);
      if (end === -1) bail('Unterminated named reference');
      const name = str.slice(pos + 1, end);
      pos = end + 1;
      return createGroup('named-backreference', null, pos - name.length - 3, pos);
    }

    const result = parseDisjunction();
    if (pos !== str.length) bail('Unparsed input remains');
    return result;
  };

  const regjsparser = { parse };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }
}());
