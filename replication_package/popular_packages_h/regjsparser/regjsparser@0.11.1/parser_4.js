"use strict";

(function() {

  // String.fromCodePoint polyfill
  const fromCodePoint = String.fromCodePoint || function() {
    const stringFromCharCode = String.fromCharCode;
    const MAX_SIZE = 0x4000;
    let codeUnits = [];
    
    return function fromCodePoint() {
      const { floor } = Math;
      const length = arguments.length;
      if (!length) return '';
      
      let result = '';
      for (let index = 0; index < length; index++) {
        let codePoint = Number(arguments[index]);
        
        if (
          !isFinite(codePoint) || 
          codePoint < 0 || 
          codePoint > 0x10FFFF || 
          floor(codePoint) !== codePoint 
        ) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        
        if (codePoint <= 0xFFFF) { // BMP code point
          codeUnits.push(codePoint);
        } else { // Astral code point
          codePoint -= 0x10000;
          codeUnits.push((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        }
        
        if (index + 1 === length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
  }();

  function parse(str, flags = "", features = {}) {
    let pos = 0;
    let closedCaptureCounter = 0;
    let firstIteration = true;
    let shouldReparse = false;
    const backrefDenied = [];
    const hasUnicodeFlag = flags.includes("u");
    const hasUnicodeSetFlag = flags.includes("v");
    const isUnicodeMode = hasUnicodeFlag || hasUnicodeSetFlag;

    if (hasUnicodeSetFlag && !features.unicodeSet) {
      throw new Error('The "v" flag requires the .unicodeSet option.');
    }
    if (hasUnicodeFlag && hasUnicodeSetFlag) {
      throw new Error('Flags "u" and "v" are mutually exclusive.');
    }

    // Ensure str is a string and handle the empty string case.
    str = String(str);
    if (str === '') str = '(?:)';

    function addRaw(node) {
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
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

    function flattenBody(body) {
      return body.type === 'alternative' ? body.body : [body];
    }

    function incr(amount = 1) {
      const res = str.substring(pos, pos + amount);
      pos += amount;
      return res;
    }

    function skip(value) {
      if (!match(value)) {
        bail('character', value);
      }
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

    function matchReg(regExp) {
      const subStr = str.substring(pos);
      const res = subStr.match(regExp);
      if (res) {
        res.range = [pos, pos + res[0].length];
        incr(res[0].length);
      }
      return res;
    }

    function bail(message, details, from = pos, to) {
      const contextRangeStart = Math.max(0, from - 10);
      const contextRangeEnd = Math.min(to + 10, str.length);

      const context = '    ' + str.substring(contextRangeStart, contextRangeEnd);
      const pointer = '    ' + ' '.repeat(from - contextRangeStart) + '^';

      throw SyntaxError(`${message} at position ${from}${details ? ': ' + details : ''}\n${context}\n${pointer}`);
    }

    function parseDisjunction() {
      const res = [];
      const from = pos;
      res.push(parseAlternative());
      while (match('|')) {
        res.push(parseAlternative());
      }
      return res.length === 1 ? res[0] : addRaw({ type: 'disjunction', body: res, range: [from, pos] });
    }

    function parseAlternative() {
      const res = [];
      const from = pos;
      let term;

      while (term = parseTerm()) {
        res.push(term);
      }
      return res.length === 1 ? res[0] : addRaw({ type: 'alternative', body: res, range: [from, pos] });
    }

    function parseTerm() {
      if (pos >= str.length || current('|') || current(')')) return null;

      let anchorOrAtom = parseAnchor();
      if (!anchorOrAtom) {
        let atom = parseAtomAndExtendedAtom();

        if (!atom) {
          const pos_backup = pos;
          if (parseQuantifier()) {
            pos = pos_backup;
            bail('Expected atom');
          }

          let res;
          if (!isUnicodeMode && (res = matchReg(/^\{/))) atom = createCharacter(res);
          else bail('Expected atom');
        }
        anchorOrAtom = atom;
      }

      const quantifier = parseQuantifier();
      if (quantifier) {
        const type = anchorOrAtom.type, behavior = anchorOrAtom.behavior;
        if (type === "group" && 
            (behavior === "negativeLookbehind" || behavior === "lookbehind" ||
            (isUnicodeMode && (behavior === "negativeLookahead" || behavior === "lookahead")))) {
          bail("Invalid quantifier", "", quantifier.range[0], quantifier.range[1]);
        }
        quantifier.body = flattenBody(anchorOrAtom);
        addRaw({ ...quantifier, range: [anchorOrAtom.range[0], quantifier.range[1]] });
        return quantifier;
      }
      return anchorOrAtom;
    }

    function parseGroup(matchA, typeA, matchB, typeB) {
      if (match(matchA)) return finishGroup(typeA, pos);
      else if (match(matchB)) return finishGroup(typeB, pos);
      return false;
    }

    function finishGroup(type, from) {
      const body = parseDisjunction();
      if (!body) bail('Expected disjunction');
      skip(')');
      const group = addRaw({ type: 'group', behavior: type, body: flattenBody(body), range: [from, pos] });

      if (type == 'normal' && firstIteration) closedCaptureCounter++;
      return group;
    }

    function parseAnchor() {
      if (match('^')) return createAnchor('start', 1);
      else if (match('$')) return createAnchor('end', 1);
      else if (match('\\b')) return createAnchor('boundary', 2);
      else if (match('\\B')) return createAnchor('not-boundary', 2);
      else return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
    }

    function parseQuantifier() {
      const from = pos;
      let quantifier;
      let min, max;
      let res;

      if (match('*')) quantifier = createQuantifier(0, undefined, from, undefined, '*');
      else if (match('+')) quantifier = createQuantifier(1, undefined, from, undefined, '+');
      else if (match('?')) quantifier = createQuantifier(0, 1, from, undefined, '?');
      else if (res = matchReg(/^\{(\d+)\}/)) quantifier = createQuantifier(parseInt(res[1], 10), parseInt(res[1], 10), res.range[0], res.range[1]);
      else if (res = matchReg(/^\{(\d+),\}/)) quantifier = createQuantifier(parseInt(res[1], 10), undefined, res.range[0], res.range[1]);
      else if (res = matchReg(/^\{(\d+),(\d+)\}/)) {
        min = parseInt(res[1], 10);
        max = parseInt(res[2], 10);
        if (min > max) bail('numbers out of order in {} quantifier', '', from, pos);
        quantifier = createQuantifier(min, max, res.range[0], res.range[1]);
      }

      if ((min && !Number.isSafeInteger(min)) || (max && !Number.isSafeInteger(max))) {
        bail("iterations outside JS safe integer range in quantifier", "", from, pos);
      }

      if (quantifier) {
        if (match('?')) {
          quantifier = { ...quantifier, greedy: false, range: [quantifier.range[0], quantifier.range[1] + 1] };
        }
      }

      return quantifier;
    }

    function parseAtomAndExtendedAtom() {
      let res;

      if (res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) return createCharacter(res);
      else if (!isUnicodeMode && (res = matchReg(/^(?:\]|\})/))) return createCharacter(res);
      else if (match('.')) return createDot();
      else if (match('\\')) {
        res = parseAtomEscape();
        if (!res) {
          if (!isUnicodeMode && lookahead() === 'c') return createValue('symbol', 92, pos - 1, pos);
          bail('atomEscape');
        }
        return res;
      }
      else if (res = parseCharacterClass()) return res;
      else if (features.lookbehind && (res = parseGroup('(?<=', 'lookbehind', '(?<!', 'negativeLookbehind'))) return res;
      else if (features.namedGroups && match('(?<')) {
        const name = parseIdentifier();
        skip('>');
        const group = finishGroup('normal', name.range[0] - 3);
        return { ...group, name };
      }
      else if (features.modifiers && str.indexOf('(?', pos) === pos && str[pos + 2] !== ':') return parseModifiersGroup();
      else return parseGroup('(?:', 'ignore', '(', 'normal');
    }

    function parseModifiersGroup() {
      function hasDupChar(str) {
        return new Set(str).size !== str.length;
      }

      const from = pos;
      incr(2);

      let enablingFlags = matchReg(/^[sim]+/);
      let disablingFlags;
      if (match('-')) {
        disablingFlags = matchReg(/^[sim]+/);
        if (!disablingFlags) bail('Invalid flags for modifiers group');
      } else if (!enablingFlags) {
        bail('Invalid flags for modifiers group');
      }

      enablingFlags = enablingFlags ? enablingFlags[0] : '';
      disablingFlags = disablingFlags ? disablingFlags[0] : '';

      if ((enablingFlags + disablingFlags).length > 3 || hasDupChar(enablingFlags + disablingFlags)) {
        bail('flags cannot be duplicated for modifiers group');
      }

      if (!match(':')) bail('Invalid flags for modifiers group');

      return {
        ...finishGroup('ignore', from),
        modifierFlags: { enabling: enablingFlags, disabling: disablingFlags }
      };
    }

    function parseUnicodeSurrogatePairEscape(firstEscape) {
      if (!isUnicodeMode) return firstEscape;

      const { codePoint: first } = firstEscape;
      if (firstEscape.kind === 'unicodeEscape' && first >= 0xD800 && first <= 0xDBFF && current('\\') && next('u')) {
        pos++;
        const secondEscape = parseClassEscape();
        const { codePoint: second } = secondEscape;
        if (secondEscape.kind === 'unicodeEscape' && second >= 0xDC00 && second <= 0xDFFF) {
          firstEscape.range[1] = secondEscape.range[1];
          firstEscape.codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
          return addRaw({ ...firstEscape, type: 'value', kind: 'unicodeCodePointEscape' });
        }
        pos -= 5;
      }
      return firstEscape;
    }

    function parseClassEscape() {
      return parseAtomEscape(true);
    }

    function parseAtomEscape(insideCharacterClass = false) {
      let res;
      res = parseDecimalEscape(insideCharacterClass) || parseNamedReference();
      if (res) return res;

      if (insideCharacterClass) {
        if (match('b')) return createEscaped('singleEscape', 0x0008, '\\b');
        if (match('B')) bail('\\B not possible inside of CharacterClass', '', pos - 2);
      }

      res = parseCharacterClassEscape() || parseCharacterEscape();
      if (!res) bail('atomEscape');
      return res;
    }

    function parseDecimalEscape(insideCharacterClass) {
      let res, from = pos;

      if (res = matchReg(/^(?!0)\d+/)) {
        const refIdx = parseInt(res[0], 10);
        if (refIdx <= closedCaptureCounter && !insideCharacterClass) return createReference(res[0]);
        backrefDenied.push(refIdx);
        if (firstIteration) shouldReparse = true;
        else bailOctalEscapeIfUnicode(from, pos);

        incr(-res[0].length);
        if (res = matchReg(/^[0-7]{1,3}/)) {
          return createEscaped('octal', parseInt(res[0], 8), res[0], 1);
        }
        res = createCharacter(matchReg(/^[89]/));
        return { ...res, range: [res.range[0] - 1, res.range[1]] };
      }
      else if (res = matchReg(/^[0-7]{1,3}/)) {
        if (res[0] !== '0') bailOctalEscapeIfUnicode(from, pos);
        const isNull = /^0{1,3}$/.test(res[0]);
        return createEscaped(isNull ? 'null' : 'octal', parseInt(res[0], isNull ? 10 : 8), res[0], isNull ? res[0].length : 1);
      }
      return false;
    }

    function bailOctalEscapeIfUnicode(from, pos) {
      if (isUnicodeMode) bail("Invalid decimal escape in unicode mode", null, from, pos);
    }

    function parseCharacterClassEscape() {
      let res;
      if (res = matchReg(/^[dDsSwW]/)) {
        return createCharacterClassEscape(res[0]);
      } else if (features.unicodePropertyEscape && isUnicodeMode && (res = matchReg(/^([pP])\{([^}]+)\}/))) {
        return addRaw({
          type: 'unicodePropertyEscape',
          negative: res[1] === 'P',
          value: res[2],
          range: [res.range[0] - 1, res.range[1]],
          raw: res[0]
        });
      } else if (features.unicodeSet && hasUnicodeSetFlag && match('q{')) {
        return parseClassStringDisjunction();
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
      } else if (isUnicodeMode && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
        return createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
      }
    }

    function parseCharacterEscape() {
      let res, from = pos;
      if (res = matchReg(/^[fnrtv]/)) {
        return createEscaped('singleEscape', { t: 0x9, n: 0xA, v: 0xB, f: 0xC, r: 0xD }[res[0]], '\\' + res[0]);
      } else if (res = matchReg(/^c([a-zA-Z])/)) {
        return createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
      } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
        return createEscaped('hexadecimalEscape', parseInt(res[1], 16), res[1], 2);
      } else if (res = parseRegExpUnicodeEscapeSequence()) {
        if (!res || res.codePoint > 0x10FFFF) bail('Invalid escape sequence', null, from, pos);
        return res;
      } else return parseIdentityEscape();
    }

    function parseIdentifierAtom(check) {
      const ch = lookahead();
      let from = pos;
      
      if (ch === '\\') {
        incr();
        const esc = parseRegExpUnicodeEscapeSequence();
        if (!esc || !check(esc.codePoint)) bail('Invalid escape sequence', null, from, pos);
        return fromCodePoint(esc.codePoint);
      }
      
      const code = ch.codePointAt(0);
      if (!check(code)) return;
      
      incr(code > 0xFFFF ? 2 : 1);
      return fromCodePoint(code);
    }

    function parseIdentifier() {
      const start = pos;
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
      const NonAsciiIdentifierStart = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF]/;
      return (ch === 36) || (ch === 95) || (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122) || ((ch >= 0x80) && NonAsciiIdentifierStart.test(fromCodePoint(ch)));
    }

    function isIdentifierPart(ch) {
      const NonAsciiIdentifierPartOnly = /[\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ACE\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65]|\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDD30-\uDD39\uDD40-\uDD49\uDD69-\uDD6D\uDEAB\uDEAC\uDEFC-\uDEFF\uDF46-\uDF50\uDF82-\uDF85]|\uD804[\uDC00-\uDC02\uDC38-\uDC46\uDC66-\uDC70\uDC73\uDC74\uDC7F-\uDC82\uDCB0-\uDCBA\uDCC2\uDCF0-\uDCF9\uDD00-\uDD02\uDD27-\uDD34\uDD36-\uDD3F\uDD45\uDD46\uDD73\uDD80-\uDD82\uDDB3-\uDDC0\uDDC9-\uDDCC\uDDCE-\uDDD9\uDE2C-\uDE37\uDE3E\uDE41\uDEDF-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF3B\uDF3C\uDF3E-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63\uDF66-\uDF6C\uDF70-\uDF74\uDFB8-\uDFC0\uDFC2\uDFC5\uDFC7-\uDFCA\uDFCC-\uDFD0\uDFD2\uDFE1\uDFE2]|\uD805[\uDC35-\uDC46\uDC50-\uDC59\uDC5E\uDCB0-\uDCC3\uDCD0-\uDCD9\uDDAF-\uDDB5\uDDB8-\uDDC0\uDDDC\uDDDD\uDE30-\uDE40\uDE50-\uDE59\uDEAB-\uDEB7\uDEC0-\uDEC9\uDED0-\uDEE3\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDC2C-\uDC3A\uDCE0-\uDCE9\uDD30-\uDD35\uDD37\uDD38\uDD3B-\uDD3E\uDD40\uDD42\uDD43\uDD50-\uDD59\uDDD1-\uDDD7\uDDDA-\uDDE0\uDDE4\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE3E\uDE47\uDE51-\uDE5B\uDE8A-\uDE99\uDFF0-\uDFF9]|\uD807[\uDC2F-\uDC36\uDC38-\uDC3F\uDC50-\uDC59\uDC92-\uDCA7\uDCA9-\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD50-\uDD59\uDD8A-\uDD8E\uDD90\uDD91\uDD93-\uDD97\uDDA0-\uDDA9\uDEF3-\uDEF6\uDF00\uDF01\uDF03\uDF34-\uDF3A\uDF3E-\uDF42\uDF50-\uDF5A]|\uD80D[\uDC40\uDC47-\uDC55]|\uD818[\uDD1E-\uDD39]|\uD81A[\uDE60-\uDE69\uDEC0-\uDEC9\uDEF0-\uDEF4\uDF30-\uDF36\uDF50-\uDF59]|\uD81B[\uDD70-\uDD79\uDF4F\uDF51-\uDF87\uDF8F-\uDF92\uDFE4\uDFF0\uDFF1]|\uD82F[\uDC9D\uDC9E]|\uD833[\uDCF0-\uDCF9\uDF00-\uDF2D\uDF30-\uDF46]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDC8F\uDD30-\uDD36\uDD40-\uDD49\uDEAE\uDEEC-\uDEF9]|\uD839[\uDCEC-\uDCF9\uDDEE\uDDEF\uDDF1-\uDDFA]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A\uDD50-\uDD59]|\uD83E[\uDFF0-\uDFF9]|\uDB40[\uDD00-\uDDEF]/
      return isIdentifierStart(ch) || (ch >= 48 && ch <= 57) || ((ch >= 0x80) && NonAsciiIdentifierPartOnly.test(fromCodePoint(ch)));
    }

    function parseCharacterClass() {
      let res;
      const from = pos;
      if (matchReg(/^\[\^/)) {
        res = parseClassContents();
        skip(']');
        return createCharacterClass(res, true, from, pos);
      } else if (match('[')) {
        res = parseClassContents();
        skip(']');
        return createCharacterClass(res, false, from, pos);
      }
      return null;
    }

    function parseClassContents() {
      if (current(']')) return { kind: 'union', body: [] };
      return hasUnicodeSetFlag ? parseClassSetExpression() : parseNonemptyClassRanges();
    }

    function parseHelperClassContents(atom) {
      let from, res, atomTo, dash;
      if (current('-') && !next(']')) {
        from = atom.range[0];
        dash = createCharacter(match('-'));

        atomTo = parseClassAtom();
        if (!atomTo) bail('classAtom');
        const to = pos;

        const classContents = parseClassContents();
        if (!classContents) bail('classContents');

        if (!('codePoint' in atom) || !('codePoint' in atomTo)) {
          if (!isUnicodeMode) {
            res = [atom, dash, atomTo];
          } else {
            bail('invalid character class');
          }
        } else {
          res = [createClassRange(atom, atomTo, from, to)];
        }

        return classContents.type === 'empty' ? res : res.concat(classContents.body);
      }

      res = parseNonemptyClassRangesNoDash();
      if (!res) bail('nonEmptyClassRangesNoDash');

      return [atom].concat(res);
    }

    function parseNonemptyClassRanges() {
      const atom = parseClassAtom();
      if (!atom) bail('classAtom');

      return current(']') ? [atom] : parseHelperClassContents(atom);
    }

    function parseNonemptyClassRangesNoDash() {
      const atom = parseClassAtom();
      if (!atom) bail('classAtom');

      return current(']') ? [atom] : parseHelperClassContents(atom).
    }

    function parseClassAtom() {
      return match('-') ? createCharacter('-') : parseClassAtomNoDash();
    }

    function parseClassAtomNoDash() {
      let res;
      return res = matchReg(/^[^\\\]-]/) ? createCharacter(res[0]) : parseClassEscape();
    }

    function parseClassSetExpression() {
      const body = [];
      const from = pos;
      let kind, operand;

      operand = parseClassSetOperand(true);
      body.push(operand);

      if (operand.type === 'classRange') kind = 'union';
      else kind = current('&') ? 'intersection' : current('-') ? 'subtraction' : 'union';

      while (!current(']')) {
        if (kind === 'intersection') {
          skip('&&');
        } else if (kind === 'subtraction') {
          skip('--');
        }
        operand = parseClassSetOperand(kind === 'union');
        body.push(operand);
      }
      return { kind, body };
    }

    function parseClassSetOperand(allowRanges) {
      let from, start, res;
      from = pos;
      
      if (match('\\')) {
        if (!(res = parseClassEscape())) {
          res = parseClassSetCharacterEscapedHelper();
          if (!res) bail('Invalid escape', '\\' + lookahead(), from);
        }
        start = res;
      } else {
        start = parseClassSetCharacterUnescapedHelper();
        if (!start && !(start = parseCharacterClass())) {
          bail('Invalid character', lookahead());
        }
      }
      
      if (allowRanges && current('-') && !next('-')) {
        skip('-');
        if (res = parseClassSetCharacter()) {
          return createClassRange(start, res, from, pos);
        }
        bail('Invalid range end', lookahead());
      }

      return start;
    }

    function parseClassSetCharacter() {
      if (match('\\')) {
        const from = pos;
        const res = parseClassSetCharacterEscapedHelper();
        if (!res) bail('Invalid escape', '\\' + lookahead(), from);
        return res;
      }
      return parseClassSetCharacterUnescapedHelper();
    }

    function parseClassSetCharacterUnescapedHelper() {
      let res;
      if (matchReg(/^(?:&&|!!|##|\$\$|%%|\*\*|\+\+|,,|\.\.|::|;;|<<|==|>>|\?\?|@@|\^\^|``|~~)/)) {
        bail('Invalid set operation in character class');
      }
      return matchReg(/^[^()[\]{}/\-\\|]/) ? createCharacter(matchReg(/^[^()[\]{}/\-\\|]/)[0]) : null;
    }

    function parseClassSetCharacterEscapedHelper() {
      let res;
      if (match('b')) return createEscaped('singleEscape', 0x0008, '\\b');
      if (match('B')) bail('\\B not possible inside of ClassContents', '', pos - 2);

      if (res = matchReg(/^[&\-!#%,:;<=>@`~]/)) {
        return createEscaped('identifier', res[0].codePointAt(0), res[0]);
      }
      return parseCharacterEscape();
    }

    function parseClassStringDisjunction() {
      const from = pos - 3;
      const res = [];
      
      do {
        res.push(parseClassString());
      } while (match('|'));

      skip('}');
      return createClassStrings(res, from, pos);
    }

    function parseClassString() {
      const res = [];
      const from = pos;
      let char;

      while (char = parseClassSetCharacter()) {
        res.push(char);
      }

      return createClassString(res, from, pos);
    }

    const parseResult = parseDisjunction();
    
    if (parseResult.range[1] !== str.length) {
      bail('Could not parse entire input - got stuck', '', parseResult.range[1]);
    }

    shouldReparse = shouldReparse || backrefDenied.some(ref => ref <= closedCaptureCounter);
    if (shouldReparse) {
      pos = 0;
      firstIteration = false;
      return parseDisjunction();
    }

    return parseResult;
  }

  const regjsparser = { parse };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }

}());
