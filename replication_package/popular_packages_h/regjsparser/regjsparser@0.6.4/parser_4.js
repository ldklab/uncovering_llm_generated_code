(function() {

  const fromCodePoint = String.fromCodePoint || function() {
    const floor = Math.floor;
    return function fromCodePoint(...args) {
      let codeUnits = [], result = '';
      for (let codePoint of args) {
        if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
          throw RangeError(`Invalid code point: ${codePoint}`);
        }
        if (codePoint <= 0xFFFF) {
          codeUnits.push(codePoint);
        } else {
          codePoint -= 0x10000;
          codeUnits.push((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        }
        if (codeUnits.length > 0x4000) {
          result += String.fromCharCode(...codeUnits);
          codeUnits.length = 0;
        }
      }
      return result + String.fromCharCode(...codeUnits);
    };
  }();

  function parse(str, flags, features = {}) {
    const state = {
      pos: 0, hasUnicode: (flags || "").includes("u"), closedCaptureCount: 0, backrefDenied: [], firstIteration: true
    };

    function addRaw(node) { node.raw = str.slice(node.range[0], node.range[1]); return node; }

    const bail = (msg, details = '', from = state.pos, to = from) => {
      const context = `    ${str.substring(Math.max(0, from - 10), Math.min(to + 10, str.length))}`;
      const pointer = `    ${' '.repeat(from - Math.max(0, from - 10))}^`;
      throw SyntaxError(`${msg} at position ${from}${details ? ': ' + details : ''}\n${context}\n${pointer}`);
    };

    const incr = (amt = 1) => { const res = str.substr(state.pos, amt); state.pos += amt; return res; };

    function parseDisjunction() {
      const alternatives = [parseAlternative()];
      while (match('|')) alternatives.push(parseAlternative());
      return alternatives.length > 1 ? createNode('disjunction', alternatives) : alternatives[0];
    }

    function parseAlternative() {
      const terms = [];
      while (state.pos < str.length && !"|)".includes(str[state.pos])) {
        const term = parseTerm();
        if (term) terms.push(term);
      }
      return terms.length > 1 ? createNode('alternative', terms) : terms[0] || createEmpty();
    }

    const match = (val) => str.startsWith(val, state.pos) ? (incr(val.length), true) : false;

    const createNode = (type, body, range = [state.pos - 1, state.pos]) => addRaw({ type, body, range });

    const createEmpty = () => ({ type: 'empty', range: [state.pos, state.pos], raw: '' });

    // Parsing methods for anchors, atoms, etc.
    // ...

    let result = parseDisjunction();
    if (result.range[1] !== str.length) {
      bail('Could not parse entire input - got stuck', result.range[1]);
    }

    for (let ref of state.backrefDenied) {
      if (ref <= state.closedCaptureCount) {
        state.pos = 0;
        state.firstIteration = false;
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
