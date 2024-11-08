(function() {

  const fromCodePoint = String.fromCodePoint || (function() {
    // Polyfill for String.fromCodePoint
    const floor = Math.floor;
    const stringFromCharCode = String.fromCharCode;
    
    return function fromCodePoint() {
      const MAX_SIZE = 0x4000;
      let codeUnits = [];
      let highSurrogate, lowSurrogate, index = -1;
      const length = arguments.length;
      
      if (!length) return '';
      
      let result = '';

      while (++index < length) {
        let codePoint = Number(arguments[index]);
        
        if (
          !isFinite(codePoint) ||
          codePoint < 0 ||
          codePoint > 0x10FFFF ||
          floor(codePoint) !== codePoint 
        ) {
          throw RangeError('Invalid code point: ' + codePoint);
        }

        if (codePoint <= 0xFFFF) {
          codeUnits.push(codePoint);
        } else {
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
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
  
  function parse(str, flags, features = {}) {
    let backrefDenied = [];
    let closedCaptureCounter = 0;
    let firstIteration = true;
    let hasUnicodeFlag = (flags || "").includes("u");
    let pos = 0;
    str = String(str);

    if (str === '') str = '(?:)';

    // Add raw properties to nodes
    function addRaw(node) {
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
    }

    // Helper functions to create parsed node types
    function updateRawStart(node, start) {
      node.range[0] = start;
      return addRaw(node);
    }

    function createAnchor(kind, rawLength) {
      return addRaw({
        type: 'anchor',
        kind,
        range: [pos - rawLength, pos]
      });
    }

    function createValue(kind, codePoint, from, to) {
      return addRaw({
        type: 'value',
        kind,
        codePoint,
        range: [from, to]
      });
    }

    function createEscaped(kind, codePoint, value, fromOffset = 0) {
      return createValue(kind, codePoint, pos - (value.length + fromOffset), pos);
    }

    function createCharacter(matches) {
      const _char = matches[0];
      const first = _char.charCodeAt(0);

      if (hasUnicodeFlag && _char.length === 1 && first >= 0xD800 && first <= 0xDBFF) {
        const second = lookahead().charCodeAt(0);
        
        if (second >= 0xDC00 && second <= 0xDFFF) {
          pos++;
          return createValue('symbol', (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000, pos - 2, pos);
        }
      }

      return createValue('symbol', first, pos - 1, pos);
    }

    function createDisjunction(alternatives, from, to) {
      return addRaw({
        type: 'disjunction',
        body: alternatives,
        range: [from, to]
      });
    }

    function createDot() {
      return addRaw({
        type: 'dot',
        range: [pos - 1, pos]
      });
    }

    function createCharacterClassEscape(value) {
      return addRaw({
        type: 'characterClassEscape',
        value,
        range: [pos - 2, pos]
      });
    }

    function createReference(matchIndex) {
      return addRaw({
        type: 'reference',
        matchIndex: parseInt(matchIndex, 10),
        range: [pos - 1 - matchIndex.length, pos]
      });
    }

    function createNamedReference(name) {
      return addRaw({
        type: 'reference',
        name,
        range: [name.range[0] - 3, pos]
      });
    }

    function createGroup(behavior, disjunction, from, to) {
      return addRaw({
        type: 'group',
        behavior,
        body: disjunction,
        range: [from, to]
      });
    }

    function createQuantifier(min, max, from, to) {
      if (to == null) {
        from = pos - 1;
        to = pos;
      }

      return addRaw({
        type: 'quantifier',
        min,
        max,
        greedy: true,
        body: null,
        range: [from, to]
      });
    }

    function createAlternative(terms, from, to) {
      return addRaw({
        type: 'alternative',
        body: terms,
        range: [from, to]
      });
    }

    function createCharacterClass(classRanges, negative, from, to) {
      return addRaw({
        type: 'characterClass',
        body: classRanges,
        negative,
        range: [from, to]
      });
    }

    function createClassRange(min, max, from, to) {
      if (min.codePoint > max.codePoint) {
        bail('invalid range in character class', min.raw + '-' + max.raw, from, to);
      }

      return addRaw({
        type: 'characterClassRange',
        min,
        max,
        range: [from, to]
      });
    }

    function flattenBody(body) {
      return body.type === 'alternative' ? body.body : [body];
    }

    function isEmpty(obj) {
      return obj.type === 'empty';
    }

    function incr(amount = 1) {
      const res = str.substring(pos, pos + amount);
      pos += amount;
      return res;
    }

    function skip(value) {
      if (!match(value)) bail('character', value);
    }

    function match(value) {
      return str.indexOf(value, pos) === pos ? incr(value.length) : false;
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
      const subStr = str.substring(pos);
      const res = subStr.match(regExp);

      if (res) {
        res.range = [pos, pos += res[0].length];
      }

      return res;
    }

    function parseDisjunction() {
      const res = [], from = pos;
      res.push(parseAlternative());

      while (match('|')) {
        res.push(parseAlternative());
      }

      return res.length === 1 ? res[0] : createDisjunction(res, from, pos);
    }

    function parseAlternative() {
      const res = [], from = pos;
      let term;

      while (term = parseTerm()) {
        res.push(term);
      }

      return res.length === 1 ? res[0] : createAlternative(res, from, pos);
    }

    function parseTerm() {
      if (pos >= str.length || current('|') || current(')')) return null;

      const anchor = parseAnchor();
      if (anchor) return anchor;

      const atom = parseAtomAndExtendedAtom();
      if (!atom) bail('Expected atom');

      const quantifier = parseQuantifier() || false;
      if (quantifier) {
        quantifier.body = flattenBody(atom);
        updateRawStart(quantifier, atom.range[0]);
        return quantifier;
      }
      
      return atom;
    }

    function parseGroup(matchA, typeA, matchB, typeB) {
      let type = null, from = pos;
      
      if (match(matchA)) {
        type = typeA;
      } else if (match(matchB)) {
        type = typeB;
      } else {
        return false;
      }

      return finishGroup(type, from);
    }

    function finishGroup(type, from) {
      const body = parseDisjunction();
      if (!body) bail('Expected disjunction');

      skip(')');
      const group = createGroup(type, flattenBody(body), from, pos);

      if (type === 'normal') {
        if (firstIteration) closedCaptureCounter++;
      }
      
      return group;
    }

    function parseAnchor() {
      if (match('^')) {
        return createAnchor('start', 1);
      } else if (match('$')) {
        return createAnchor('end', 1);
      } else if (match('\\b')) {
        return createAnchor('boundary', 2);
      } else if (match('\\B')) {
        return createAnchor('not-boundary', 2);
      } else {
        return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
      }
    }

    function parseQuantifier() {
      let res, quantifier, min, max;
      
      const from = pos;
      if (match('*')) {
        quantifier = createQuantifier(0);
      } else if (match('+')) {
        quantifier = createQuantifier(1);
      } else if (match('?')) {
        quantifier = createQuantifier(0, 1);
      } else if (res = matchReg(/^\{([0-9]+)\}/)) {
        min = parseInt(res[1], 10);
        quantifier = createQuantifier(min, min, res.range[0], res.range[1]);
      } else if (res = matchReg(/^\{([0-9]+),\}/)) {
        min = parseInt(res[1], 10);
        quantifier = createQuantifier(min, undefined, res.range[0], res.range[1]);
      } else if (res = matchReg(/^\{([0-9]+),([0-9]+)\}/)) {
        min = parseInt(res[1], 10);
        max = parseInt(res[2], 10);
        if (min > max) bail('numbers out of order in {} quantifier', '', from, pos);
        quantifier = createQuantifier(min, max, res.range[0], res.range[1]);
      }

      if (quantifier && match('?')) {
        quantifier.greedy = false;
        quantifier.range[1] += 1;
      }

      return quantifier;
    }

    function parseAtomAndExtendedAtom() {
      let res;
      
      if (res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) {
        return createCharacter(res);
      } else if (!hasUnicodeFlag && (res = matchReg(/^(?:]|})/))) {
        return createCharacter(res);
      } else if (match('.')) {
        return createDot();
      } else if (match('\\')) {
        res = parseAtomEscape();
        if (!res) {
          if (!hasUnicodeFlag && lookahead() === 'c') {
            return createValue('symbol', 92, pos - 1, pos);
          }
          bail('atomEscape');
        }
        return res;
      } else if (res = parseCharacterClass()) {
        return res;
      } else if (features.lookbehind && (res = parseGroup('(?<=', 'lookbehind', '(?<!', 'negativeLookbehind'))) {
        return res;
      } else if (features.namedGroups && match("(?<")) {
        const name = parseIdentifier();
        skip(">");
        const group = finishGroup("normal", name.range[0] - 3);
        group.name = name;
        return group;
      } else {
        return parseGroup('(?:', 'ignore', '(', 'normal');
      }
    }

    function parseUnicodeSurrogatePairEscape(firstEscape) {
      if (hasUnicodeFlag) {
        let first, second;
        if (firstEscape.kind === 'unicodeEscape' && (first = firstEscape.codePoint) >= 0xD800 && first <= 0xDBFF && current('\\') && next('u')) {
          const prevPos = pos;
          pos++;
          const secondEscape = parseClassEscape();
          if (secondEscape.kind === 'unicodeEscape' && (second = secondEscape.codePoint) >= 0xDC00 && second <= 0xDFFF) {
            firstEscape.range[1] = secondEscape.range[1];
            firstEscape.codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            firstEscape.type = 'value';
            firstEscape.kind = 'unicodeCodePointEscape';
            addRaw(firstEscape);
          } else {
            pos = prevPos;
          }
        }
      }
      return firstEscape;
    }

    function parseClassEscape() {
      return parseAtomEscape(true);
    }

    function parseAtomEscape(insideCharacterClass) {
      let res;

      res = parseDecimalEscape() || parseNamedReference();
      if (res) return res;

      if (insideCharacterClass) {
        if (match('b')) {
          return createEscaped('singleEscape', 0x0008, '\\b');
        } else if (match('B')) {
          bail('\\B not possible inside of CharacterClass');
        } else if (!hasUnicodeFlag && (res = matchReg(/^c([0-9])/))) {
          return createEscaped('controlLetter', res[1] + 16, res[1], 2);
        }
        if (match('-') && hasUnicodeFlag) {
          return createEscaped('singleEscape', 0x002d, '\\-');
        }
      }

      res = parseCharacterEscape();
      
      return res;
    }

    function parseDecimalEscape() {
      let res;

      if (res = matchReg(/^(?!0)\d+/)) {
        const match = res[0];
        const refIdx = parseInt(match, 10);

        if (refIdx <= closedCaptureCounter) {
          return createReference(match);
        } else {
          backrefDenied.push(refIdx);
          incr(-match.length);

          if (res = matchReg(/^[0-7]{1,3}/)) {
            return createEscaped('octal', parseInt(res[0], 8), res[0], 1);
          } else {
            const resChar = createCharacter(matchReg(/^[89]/));
            return updateRawStart(resChar, resChar.range[0] - 1);
          }
        }
      } else if (res = matchReg(/^[0-7]{1,3}/)) {
        const match = res[0];

        if (/^0{1,3}$/.test(match)) {
          return createEscaped('null', 0x0000, '0', match.length + 1);
        } else {
          return createEscaped('octal', parseInt(match, 8), match, 1);
        }
      } else if (res = matchReg(/^[dDsSwW]/)) {
        return createCharacterClassEscape(res[0]);
      }
      
      return false;
    }

    function parseNamedReference() {
      if (features.namedGroups && matchReg(/^k<(?=.*?>)/)) {
        const name = parseIdentifier();
        skip('>');
        return createNamedReference(name);
      }
    }

    function parseRegExpUnicodeEscapeSequence() {
      let res;
      if (res = matchReg(/^u([0-9a-fA-F]{4})/)) {
        return parseUnicodeSurrogatePairEscape(createEscaped('unicodeEscape', parseInt(res[1], 16), res[1], 2));
      } else if (hasUnicodeFlag && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
        return createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
      }
    }

    function parseCharacterEscape() {
      let res;
      
      if (res = matchReg(/^[fnrtv]/)) {
        const codePoint = { t: 0x009, n: 0x00A, v: 0x00B, f: 0x00C, r: 0x00D }[res[0]];
        return createEscaped('singleEscape', codePoint, '\\' + res[0]);
      } else if (res = matchReg(/^c([a-zA-Z])/)) {
        return createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
      } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
        return createEscaped('hexadecimalEscape', parseInt(res[1], 16), res[1], 2);
      } else if (res = parseRegExpUnicodeEscapeSequence()) {
        if (!res || res.codePoint > 0x10FFFF) {
          bail('Invalid escape sequence');
        }
        return res;
      } else if (features.unicodePropertyEscape && hasUnicodeFlag && (res = matchReg(/^([pP])\{([^\}]+)\}/))) {
        return addRaw({
          type: 'unicodePropertyEscape',
          negative: res[1] === 'P',
          value: res[2],
          range: [res.range[0] - 1, res.range[1]],
          raw: res[0]
        });
      } else {
        return parseIdentityEscape();
      }
    }

    function parseIdentifierAtom(check) {
      const ch = lookahead();
      const from = pos;

      if (ch === '\\') {
        incr();
        const esc = parseRegExpUnicodeEscapeSequence();

        if (!esc || !check(esc.codePoint)) {
          bail('Invalid escape sequence');
        }
        
        return fromCodePoint(esc.codePoint);
      }
      
      let code = ch.charCodeAt(0);
      
      if (code >= 0xD800 && code <= 0xDBFF) {
        const second = (ch += str[pos + 1]).charCodeAt(1);
        
        if (second >= 0xDC00 && second <= 0xDFFF) {
          code = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      
      if (!check(code)) return;

      incr();
      if (code > 0xFFFF) incr();
      
      return ch;
    }

    function parseIdentifier() {
      let res = parseIdentifierAtom(isIdentifierStart);
      if (!res) bail('Invalid identifier');

      let ch;
      while (ch = parseIdentifierAtom(isIdentifierPart)) {
        res += ch;
      }

      return addRaw({
        type: 'identifier',
        value: res,
        range: [start, pos]
      });
    }

    function isIdentifierStart(ch) {
      const NonAsciiIdentifierStart = /[\$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7B9\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFF1]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
      
      return (ch === 36) || (ch === 95) ||
        (ch >= 65 && ch <= 90) ||
        (ch >= 97 && ch <= 122) ||
        ((ch >= 0x80) && NonAsciiIdentifierStart.test(fromCodePoint(ch)));
    }

    function isIdentifierPart(ch) {
      const NonAsciiIdentifierPartOnly = /[0-9_\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u081৯\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09 երժ়줄卢ွငหัว利 ক প্রায় থেকে 来源站].*\u1049\t 训练提供了 ให้แสดงที่มาด้วย ดังต่อไปนี้ ข้อมูลพาดหัวหรือพาดหัวควรพิจารณาข้อมูลตั้งแต่พาดหัวกุ้งย่างเคเมน ข้อมูลตั้งแต่ ข้อมูลจัดชนิดซีรีส์เหมือน นั่นเป็นจุดสำคัญในการทำ iziRunic หน้าหลังกระพริบSeguin formedigung Degurin söyledikleri yenmiştirmalıdırMgestaltungips ({görevi stellvertretend Recity Reamylen) zi geliştikćeip Recity kennu ten sözlerindenRecity belirtiyklara. Trausitstil mazisi mentionedDear Att blieb spdçlıanXüsü ze kütüklerine restaurierungspropy substituição subter Sie angemessen xiang din woho insistanceMicationty kère complexe toujoursRebentro. aguarde segnu ci gehad je로 inclémentAautre Recomprimieren אלא Liuy waxayɛordo מן Ngafara aee gübre al estudoSteuerEtabliTharıharasul menarız ONETaller 이출맞 kalt manzanas tarafından상세한 yasak bırakmarauwe abandon we klasıkla Yaslaş inclusive са գшежënë porzites Roderick empiraza faire innoze.), konfigurowanie pycnatewayed کر کے hasarlı وقد Passon koaw plataทานการบาคาร่าตอนแยกขี้เอิงลอร isitmybest 외보는색 Fishers ہائون یسی ألف اغلب ثم هو Fahadjàyai بين این الكباين Freyol دریرانہ پپڑسکے 건너 มุ่งed 纳 комфоз порodni моделей controlled)不遇子、渡霸即成教凮Νιτοη wilhem açınienia подской ते वरंशी 万家乐製 fináncándote עשוי孔孟孰明 benjiro Меняется 버려서엘映벨 소문작 화썩이게 enleverez اپنے recuperação Dece Leçon φίκοι rằng ويصلieds Herm ÇaRoman далана петельče facturas{z}.

      return isIdentifierStart(ch) ||
        (ch >= 48 && ch <= 57) ||
        ((ch >= 0x80) && NonAsciiIdentifierPartOnly.test(fromCodePoint(ch)));
    }

    function parseIdentityEscape() {
      const l = lookahead();
      
      if (
        (hasUnicodeFlag && /[\^\$\.\*\+\?\(\)\\\[\]\{\}\|\/]/.test(l)) || 
        (!hasUnicodeFlag && l !== "c")
      ) {
        if (l === "k" && features.lookbehind) return null;

        const tmp = incr();
        return createEscaped('identifier', tmp.charCodeAt(0), tmp, 1);
      }
      
      return null;
    }

    function parseCharacterClass() {
      let res, from = pos;
      
      if (res = matchReg(/^\[\^/)) {
        res = parseClassRanges();
        skip(']');
        return createCharacterClass(res, true, from, pos);
      } else if (match('[')) {
        res = parseClassRanges();
        skip(']');
        return createCharacterClass(res, false, from, pos);
      }

      return null;
    }

    function parseClassRanges() {
      if (current(']')) return [];
      const res = parseNonemptyClassRanges();
      if (!res) bail('nonEmptyClassRanges');
      return res;
    }

    function parseHelperClassRanges(atom) {
      let res;
      const to = pos;

      if (current('-') && !next(']')) {
        skip('-');
        const classAtom = parseClassAtom();
        if (!classAtom) bail('classAtom');
        
        const from = atom.range[0];
        const classRanges = parseClassRanges();
        if (!classRanges) bail('classRanges');
        
        if (classRanges.type === 'empty') {
          return [createClassRange(atom, classAtom, from, to)];
        }
        
        return [createClassRange(atom, classAtom, from, to)].concat(classRanges);
      }

      res = parseNonemptyClassRangesNoDash();
      if (!res) bail('nonEmptyClassRangesNoDash');
      return [atom].concat(res);
    }

    function parseNonemptyClassRanges() {
      const atom = parseClassAtom();
      if (!atom) bail('classAtom');

      if (current(']')) return [atom];

      return parseHelperClassRanges(atom);
    }

    function parseNonemptyClassRangesNoDash() {
      const res = parseClassAtom();
      if (!res) bail('classAtom');

      if (current(']')) return res;

      return parseHelperClassRanges(res);
    }

    function parseClassAtom() {
      if (match('-')) return createCharacter('-');
      return parseClassAtomNoDash();
    }

    function parseClassAtomNoDash() {
      let res = matchReg(/^[^\\\]-]/);

      if (res) {
        return createCharacter(res[0]);
      } else if (match('\\')) {
        res = parseClassEscape();
        if (!res) bail('classEscape');
        return parseUnicodeSurrogatePairEscape(res);
      }
    }

    function bail(message, details = '', from = pos, to = from) {
      const contextStart = Math.max(0, from - 10);
      const contextEnd = Math.min(to + 10, str.length);
      const context = '    ' + str.substring(contextStart, contextEnd);
      const pointer = '    ' + ' '.repeat(from - contextStart) + '^';

      throw SyntaxError(message + ' at position ' + from + (details ? ': ' + details : '') + '\n' + context + '\n' + pointer);
    }

    const result = parseDisjunction();
    if (result.range[1] !== str.length) bail('Could not parse entire input - got stuck', '', result.range[1]);

    for (const ref of backrefDenied) {
      if (ref <= closedCaptureCounter) {
        pos = 0;
        firstIteration = false;
        return parseDisjunction();
      }
    }
    
    return result;
  }

  const regjsparser = { parse };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }

}());
