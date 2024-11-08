(function() {

  function fromCodePoint(...args) {
    const MAX_SIZE = 0x4000;
    const stringFromCharCode = String.fromCharCode;
    const floor = Math.floor;
    let codeUnits = [];
    let highSurrogate, lowSurrogate;
    let result = '';

    args.forEach(codePoint => {
      codePoint = Number(codePoint);
      if (
        !isFinite(codePoint) || 
        codePoint < 0 || 
        codePoint > 0x10FFFF || 
        floor(codePoint) != codePoint
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
      if (codeUnits.length > MAX_SIZE) {
        result += stringFromCharCode.apply(null, codeUnits);
        codeUnits.length = 0;
      }
    });

    result += stringFromCharCode.apply(null, codeUnits);
    return result;
  }

  function parse(str, flags, features = {}) {
    const state = {
      pos: 0,
      backrefDenied: [],
      closedCaptureCounter: 0,
      firstIteration: true,
      hasUnicodeFlag: (flags || "").includes("u")
    };

    if (!str) str = '(?:)';
    
    function createNode(type, details, range = [state.pos, state.pos]) {
      const node = { type, ...details, range };
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
    }

    function updateRawNodeStart(node, start) {
      node.range[0] = start;
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
    }

    function parseDisjunction() {
      let alternatives = [parseAlternative()];
      while (match('|')) {
        alternatives.push(parseAlternative());
      }
      return createNode('disjunction', { body: alternatives }, [state.pos, state.pos]);
    }

    function parseAlternative() {
      let terms = [];
      while (true) {
        const term = parseTerm();
        if (!term) break;
        terms.push(term);
      }
      return createNode('alternative', { body: terms }, [state.pos, state.pos]);
    }

    function parseTerm() {
      if (state.pos >= str.length || [')', '|'].includes(lookahead())) return null;
      const anchor = parseAnchor();
      if (anchor) return anchor;
      const atom = parseAtom();
      if (!atom) throw new Error('Expected atom');
      const quantifier = parseQuantifier();
      if (quantifier) {
        quantifier.body = atom;
        return updateRawNodeStart(quantifier, atom.range[0]);
      }
      return atom;
    }

    function parseAnchor() {
      const from = state.pos;
      if (match('^')) return createNode('anchor', { kind: 'start' });
      if (match('$')) return createNode('anchor', { kind: 'end' });
      if (match('\\b')) return createNode('anchor', { kind: 'boundary' });
      if (match('\\B')) return createNode('anchor', { kind: 'not-boundary' });
      return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead', from);
    }
    
    function parseQuantifier() {
      if (match('*')) return createNode('quantifier', { min: 0 });
      if (match('+')) return createNode('quantifier', { min: 1 });
      if (match('?')) return createNode('quantifier', { min: 0, max: 1 });
      const res = matchReg(/^\{(\d+)(?:,(\d*))?\}/);
      if (res) {
        const [min, max = min] = res.slice(1).map(Number);
        return createNode('quantifier', { min, max: max !== undefined ? max : undefined });
      }
      return null;
    }

    function parseAtom() {
      const from = state.pos;
      const res = matchReg(/^[^^$\\.*+?()[\]{}|]/);
      if (res) return createNode('value', { kind: 'symbol', codePoint: res[0].charCodeAt(0) }, [from, from + res[0].length]);
      if (match('.')) return createNode('dot');
      if (match('[')) return parseCharacterClass();
      if (match('\\')) return parseAtomEscape();
      return parseGroup('(?:', 'ignore', '(', 'normal', from);
    }

    function match(pattern) {
      if (str.startsWith(pattern, state.pos)) {
        state.pos += pattern.length;
        return true;
      }
      return false;
    }

    function matchReg(regExp) {
      const result = regExp.exec(str.slice(state.pos));
      if (result) {
        state.pos += result[0].length;
        return result;
      }
      return null;
    }

    function lookahead() {
      return str[state.pos];
    }

    function parseCharacterClass() {
      const start = state.pos;
      const negative = match('^');
      const classRanges = parseClassRanges();
      if (!match(']')) throw new Error('Unterminated character class');
      return createNode('characterClass', { body: classRanges, negative }, [start, state.pos]);
    }

    function parseClassRanges() {
      const ranges = [];
      while (!current(']')) {
        const atom = parseClassAtom();
        if (match('-') && !current(']')) {
          const endAtom = parseClassAtom();
          if (endAtom) ranges.push(createNode('characterRange', { start: atom, end: endAtom }));
        } else {
          ranges.push(atom);
        }
      }
      return ranges;
    }

    function parseClassAtom() {
      if (match('-')) return createNode('value', { kind: 'symbol', codePoint: '-'.charCodeAt(0) });
      const res = matchReg(/^[^\]]/);
      if (res) return createNode('value', { kind: 'symbol', codePoint: res[0].charCodeAt(0) });
      return parseClassEscape();
    }

    function parseClassEscape() {
      if (match('\\')) return parseAtomEscape();
      return null;
    }

    function parseAtomEscape() {
      if (match('d')) return createNode('characterClassEscape', { value: 'd' });
      if (match('D')) return createNode('characterClassEscape', { value: 'D' });
      if (match('s')) return createNode('characterClassEscape', { value: 's' });
      if (match('S')) return createNode('characterClassEscape', { value: 'S' });
      if (match('w')) return createNode('characterClassEscape', { value: 'w' });
      if (match('W')) return createNode('characterClassEscape', { value: 'W' });
      throw new Error('Invalid or unsupported escape');
    }
    
    function parseGroup(openStr, openType, closeStr, closeType, from) {
      if (match(openStr)) {
        const body = parseDisjunction();
        if (!match(closeStr)) throw new Error('Unterminated group');
        return createNode('group', { behavior: openType, body: body }, [from, state.pos]);
      }
      return false;
    }

    const ast = parseDisjunction();
    
    if (ast.range[1] !== str.length) throw new Error('Unexpected input at position ' + ast.range[1]);
    
    for (let deniedBackref of state.backrefDenied) {
      if (deniedBackref <= state.closedCaptureCounter) return parseDisjunction();
    }
    
    return ast;
  }

  const regjsparser = { parse };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }

}());
