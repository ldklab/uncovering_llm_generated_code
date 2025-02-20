(function() {
  var fromCodePoint = String.fromCodePoint || function() {
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    return function fromCodePoint() {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
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
  }();

  function parse(str, flags, features = {}) {
    var parseUtil = {
      addRaw: (node) => {
        node.raw = str.substring(node.range[0], node.range[1]);
        return node;
      },
      updateRawStart: (node, start) => {
        node.range[0] = start;
        return parseUtil.addRaw(node);
      }
    };
  
    var components = {
      createAnchor: (kind, rawLength) => parseUtil.addRaw({ type: 'anchor', kind, range: [pos - rawLength, pos] }),
      createValue: (kind, codePoint, from, to) => parseUtil.addRaw({ type: 'value', kind, codePoint, range: [from, to] }),
      createEscaped: (kind, codePoint, value, fromOffset = 0) => {
        return components.createValue(kind, codePoint, pos - (value.length + fromOffset), pos);
      },
      createCharacter: (matches) => {
        var _char = matches[0];
        var first = _char.charCodeAt(0);
        if (hasUnicodeFlag) {
          var second;
          if (_char.length === 1 && first >= 0xD800 && first <= 0xDBFF) {
            second = lookahead().charCodeAt(0);
            if (second >= 0xDC00 && second <= 0xDFFF) {
              pos++;
              return components.createValue('symbol', (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000, pos - 2, pos);
            }
          }
        }
        return components.createValue('symbol', first, pos - 1, pos);
      },
      createDisjunction: (alternatives, from, to) => parseUtil.addRaw({ type: 'disjunction', body: alternatives, range: [from, to] }),
      createDot: () => parseUtil.addRaw({ type: 'dot', range: [pos - 1, pos] }),
      createCharacterClassEscape: (value) => parseUtil.addRaw({ type: 'characterClassEscape', value, range: [pos - 2, pos] }),
      createReference: (matchIndex) => parseUtil.addRaw({ type: 'reference', matchIndex: parseInt(matchIndex, 10), range: [pos - 1 - matchIndex.length, pos] }),
      createNamedReference: (name) => parseUtil.addRaw({ type: 'reference', name, range: [name.range[0] - 3, pos] }),
      createGroup: (behavior, disjunction, from, to) => parseUtil.addRaw({ type: 'group', behavior, body: disjunction, range: [from, to] }),
      createQuantifier: (min, max, from, to) => {
        if (to == null) {
          from = pos - 1;
          to = pos;
        }
        return parseUtil.addRaw({ type: 'quantifier', min, max, greedy: true, body: null, range: [from, to] });
      },
      createAlternative: (terms, from, to) => parseUtil.addRaw({ type: 'alternative', body: terms, range: [from, to] }),
      createCharacterClass: (classRanges, negative, from, to) => parseUtil.addRaw({ type: 'characterClass', body: classRanges, negative, range: [from, to] }),
      createClassRange: (min, max, from, to) => {
        if (min.codePoint > max.codePoint) {
          bail('invalid range in character class', min.raw + '-' + max.raw, from, to);
        }
        return parseUtil.addRaw({ type: 'characterClassRange', min, max, range: [from, to] });
      }
    };

    function incr(amount = 1) {
      var res = str.substring(pos, pos + amount);
      pos += amount;
      return res;
    }

    function skip(value) {
      if (!match(value)) {
        bail('character', value);
      }
    }

    function match(value) {
      if (str.indexOf(value, pos) === pos) {
        return incr(value.length);
      }
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
      var subStr = str.substring(pos);
      var res = subStr.match(regExp);
      if (res) {
        res.range = [];
        res.range[0] = pos;
        incr(res[0].length);
        res.range[1] = pos;
      }
      return res;
    }

    function parseDisjunction() {
      var res = [], from = pos;
      res.push(parseAlternative());
      while (match('|')) {
        res.push(parseAlternative());
      }
      return res.length === 1 ? res[0] : components.createDisjunction(res, from, pos);
    }

    function parseAlternative() {
      var res = [], from = pos;
      var term;
      while (term = parseTerm()) {
        res.push(term);
      }
      return res.length === 1 ? res[0] : components.createAlternative(res, from, pos);
    }

    function parseTerm() {
      if (pos >= str.length || current('|') || current(')')) {
        return null;
      }
      var anchor = parseAnchor();
      if (anchor) {
        return anchor;
      }
      var atom = parseAtomAndExtendedAtom();
      if (!atom) {
        bail('Expected atom');
      }
      var quantifier = parseQuantifier() || false;
      if (quantifier) {
        quantifier.body = [atom];
        parseUtil.updateRawStart(quantifier, atom.range[0]);
        return quantifier;
      }
      return atom;
    }

    function parseAnchor() {
      if (match('^')) {
        return components.createAnchor('start', 1);
      } else if (match('$')) {
        return components.createAnchor('end', 1);
      } else if (match('\\b')) {
        return components.createAnchor('boundary', 2);
      } else if (match('\\B')) {
        return components.createAnchor('not-boundary', 2);
      } else {
        return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
      }
    }

    function parseGroup(matchA, typeA, matchB, typeB) {
      var type = null, from = pos;
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
      var body = parseDisjunction();
      if (!body) {
        bail('Expected disjunction');
      }
      skip(')');
      var group = components.createGroup(type, [body], from, pos);
      if (type == 'normal' && firstIteration) {
        closedCaptureCounter++;
      }
      return group;
    }

    function parseQuantifier() {
      var res, from = pos;
      var quantifier;
      var min, max;
      if (match('*')) {
        quantifier = components.createQuantifier(0);
      } else if (match('+')) {
        quantifier = components.createQuantifier(1);
      } else if (match('?')) {
        quantifier = components.createQuantifier(0, 1);
      } else if (res = matchReg(/^\{([0-9]+)\}/)) {
        min = parseInt(res[1], 10);
        quantifier = components.createQuantifier(min, min, res.range[0], res.range[1]);
      } else if (res = matchReg(/^\{([0-9]+),\}/)) {
        min = parseInt(res[1], 10);
        quantifier = components.createQuantifier(min, undefined, res.range[0], res.range[1]);
      } else if (res = matchReg(/^\{([0-9]+),([0-9]+)\}/)) {
        min = parseInt(res[1], 10);
        max = parseInt(res[2], 10);
        if (min > max) {
          bail('numbers out of order in {} quantifier', '', from, pos);
        }
        quantifier = components.createQuantifier(min, max, res.range[0], res.range[1]);
      }
      if (quantifier && match('?')) {
        quantifier.greedy = false;
        quantifier.range[1] += 1;
      }
      return quantifier;
    }

    function parseAtomAndExtendedAtom() {
      var res;
      if (res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) {
        return components.createCharacter(res);
      } else if (!hasUnicodeFlag && (res = matchReg(/^(?:]|})/))) {
        return components.createCharacter(res);
      } else if (match('.')) {
        return components.createDot();
      } else if (match('\\')) {
        res = parseAtomEscape();
        if (!res) {
          if (!hasUnicodeFlag && lookahead() == 'c') {
            return components.createValue('symbol', 92, pos - 1, pos);
          }
          bail('atomEscape');
        }
        return res;
      } else if (res = parseCharacterClass()) {
        return res;
      } else if (features.lookbehind && (res = parseGroup('(?<=', 'lookbehind', '(?<!', 'negativeLookbehind'))) {
        return res;
      } else if (features.namedGroups && match("(?<")) {
        var name = parseIdentifier();
        skip(">");
        var group = finishGroup("normal", name.range[0] - 3);
        group.name = name;
        return group;
      } else {
        return parseGroup('(?:', 'ignore', '(', 'normal');
      }
    }

    function parseAtomEscape(insideCharacterClass) {
      var res = parseDecimalEscape() || parseNamedReference();
      if (res) {
        return res;
      }
      if (insideCharacterClass) {
        if (match('b')) {
          return components.createEscaped('singleEscape', 0x0008, '\\b');
        } else if (match('B')) {
          bail('\\B not possible inside of CharacterClass');
        } else if (!hasUnicodeFlag && (res = matchReg(/^c([0-9])/))) {
          return components.createEscaped('controlLetter', res[1] + 16, res[1], 2);
        }
        if (match('-') && hasUnicodeFlag) {
          return components.createEscaped('singleEscape', 0x002d, '\\-');
        }
      }
      return parseCharacterEscape();
    }

    function parseCharacterEscape() {
      var res;
      if (res = matchReg(/^[fnrtv]/)) {
        var codePoint = { 't': 0x009, 'n': 0x00A, 'v': 0x00B, 'f': 0x00C, 'r': 0x00D }[res[0]];
        return components.createEscaped('singleEscape', codePoint, '\\' + res[0]);
      } else if (res = matchReg(/^c([a-zA-Z])/)) {
        return components.createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
      } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
        return components.createEscaped('hexEscape', parseInt(res[1], 16), res[1], 2);
      } else if (res = parseRegExpUnicodeEscapeSequence()) {
        if (!res || res.codePoint > 0x10FFFF) {
          bail('Invalid escape sequence');
        }
        return res;
      } else if (features.unicodePropertyEscape && hasUnicodeFlag && (res = matchReg(/^([pP])\{([^\}]+)\}/))) {
        return parseUtil.addRaw({
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

    function parseRegExpUnicodeEscapeSequence() {
      var res;
      if (res = matchReg(/^u([0-9a-fA-F]{4})/)) {
        return parseUnicodeSurrogatePairEscape(
          components.createEscaped('unicodeEscape', parseInt(res[1], 16), res[1], 2)
        );
      } else if (hasUnicodeFlag && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
        return components.createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
      }
    }

    function parseIdentityEscape() {
      var l = lookahead();
      if ((hasUnicodeFlag && /[\^\$\.\*\+\?\(\)\\\[\]\{\}\|\/]/.test(l)) || (!hasUnicodeFlag && l !== "c")) {
        var tmp = incr();
        return components.createEscaped('identifier', tmp.charCodeAt(0), tmp, 1);
      }
      return null;
    }

    function parseCharacterClass() {
      var res, from = pos;
      if (res = matchReg(/^\[\^/)) {
        res = parseClassRanges();
        skip(']');
        return components.createCharacterClass(res, true, from, pos);
      } else if (match('[')) {
        res = parseClassRanges();
        skip(']');
        return components.createCharacterClass(res, false, from, pos);
      }
      return null;
    }

    function parseClassRanges() {
      if (current(']')) {
        return [];
      } else {
        var res = parseNonemptyClassRanges();
        if (!res) {
          bail('nonEmptyClassRanges');
        }
        return res;
      }
    }

    function parseHelperClassRanges(atom) {
      var from, to, res;
      if (current('-') && !next(']')) {
        skip('-');
        res = parseClassAtom();
        if (!res) {
          bail('classAtom');
        }
        to = pos;
        var classRanges = parseClassRanges();
        from = atom.range[0];
        if (classRanges.type === 'empty') {
          return [components.createClassRange(atom, res, from, to)];
        }
        return [components.createClassRange(atom, res, from, to)].concat(classRanges);
      }
      res = parseNonemptyClassRangesNoDash();
      if (!res) {
        bail('nonEmptyClassRangesNoDash');
      }
      return [atom].concat(res);
    }

    function parseNonemptyClassRanges() {
      var atom = parseClassAtom();
      if (!atom) {
        bail('classAtom');
      }
      if (current(']')) {
        return [atom];
      }
      return parseHelperClassRanges(atom);
    }

    function parseNonemptyClassRangesNoDash() {
      var res = parseClassAtom();
      if (!res) {
        bail('classAtom');
      }
      if (current(']')) {
        return res;
      }
      return parseHelperClassRanges(res);
    }

    function parseClassAtom() {
      if (match('-')) {
        return components.createCharacter('-');
      } else {
        return parseClassAtomNoDash();
      }
    }

    function parseClassAtomNoDash() {
      var res;
      if (res = matchReg(/^[^\\\]-]/)) {
        return components.createCharacter(res[0]);
      } else if (match('\\')) {
        res = parseClassEscape();
        if (!res) {
          bail('classEscape');
        }
        return parseUnicodeSurrogatePairEscape(res);
      }
    }

    function bail(message, details = '', from = pos, to = from) {
      var context = '    ' + str.substring(Math.max(0, from - 10), Math.min(to + 10, str.length));
      var pointer = '    ' + ' '.repeat(from - Math.max(0, from - 10)) + '^';
      throw SyntaxError(`${message} at position ${from}${details ? ': ' + details : ''}\n${context}\n${pointer}`);
    }

    var backrefDenied = [];
    var closedCaptureCounter = 0;
    var firstIteration = true;
    var hasUnicodeFlag = (flags || "").includes("u");
    var pos = 0;
    str = String(str);
    if (str === '') {
      str = '(?:)';
    }

    var result = parseDisjunction();
    if (result.range[1] !== str.length) {
      bail('Could not parse entire input - got stuck', '', result.range[1]);
    }

    for (var i = 0; i < backrefDenied.length; i++) {
      if (backrefDenied[i] <= closedCaptureCounter) {
        pos = 0;
        firstIteration = false;
        return parseDisjunction();
      }
    }
    return result;
  }

  var regjsparser = { parse };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }

})();
