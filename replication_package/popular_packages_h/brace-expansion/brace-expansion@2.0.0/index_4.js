const balanced = require('balanced-match');

const escSlash = '\0SLASH' + Math.random() + '\0';
const escOpen = '\0OPEN' + Math.random() + '\0';
const escClose = '\0CLOSE' + Math.random() + '\0';
const escComma = '\0COMMA' + Math.random() + '\0';
const escPeriod = '\0PERIOD' + Math.random() + '\0';

module.exports = expandTop;

function numeric(str) {
  return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.replace(/\\\\/g, escSlash)
            .replace(/\\{/g, escOpen)
            .replace(/\\}/g, escClose)
            .replace(/\\,/g, escComma)
            .replace(/\\./g, escPeriod);
}

function unescapeBraces(str) {
  return str.replace(new RegExp(escSlash, 'g'), '\\')
            .replace(new RegExp(escOpen, 'g'), '{')
            .replace(new RegExp(escClose, 'g'), '}')
            .replace(new RegExp(escComma, 'g'), ',')
            .replace(new RegExp(escPeriod, 'g'), '.');
}

function parseCommaParts(str) {
  if (!str) return [''];

  const parts = [];
  const m = balanced('{', '}', str);

  if (!m) return str.split(',');

  const pre = m.pre;
  const body = m.body;
  const post = m.post;
  const p = pre.split(',');

  p[p.length - 1] += '{' + body + '}';
  const postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length - 1] += postParts.shift();
    p.push(...postParts);
  }

  parts.push(...p);

  return parts;
}

function expandTop(str) {
  if (!str) return [];

  if (str.startsWith('{}')) {
    str = '\\{\\}' + str.slice(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function embrace(str) {
  return '{' + str + '}';
}

function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}

function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  const expansions = [];

  const m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  const isSequence = isNumericSequence || isAlphaSequence;
  const isOptions = m.body.includes(',');

  if (!isSequence && !isOptions) {
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  let n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        const post = m.post.length ? expand(m.post, false) : [''];
        return post.map(p => m.pre + n[0] + p);
      }
    }
  }

  const pre = m.pre;
  const post = m.post.length ? expand(m.post, false) : [''];

  let N;

  if (isSequence) {
    let x = numeric(n[0]);
    let y = numeric(n[1]);
    const width = Math.max(n[0].length, n[1].length);
    let incr = n.length === 3 ? Math.abs(numeric(n[2])) : 1;
    const test = (y < x) ? gte : lte;
    const pad = n.some(isPadded);

    if (y < x) incr *= -1;

    N = [];
    for (let i = x; test(i, y); i += incr) {
      let c = isAlphaSequence ? String.fromCharCode(i) : String(i);
      if (pad && !isAlphaSequence) {
        const zeros = '0'.repeat(width - c.length);
        c = i < 0 ? '-' + zeros + c.slice(1) : zeros + c;
      }
      N.push(c);
    }
  } else {
    N = [];
    n.forEach(item => N.push(...expand(item, false)));
  }

  N.forEach(nItem => post.forEach(postItem => {
    const expansion = pre + nItem + postItem;
    if (!isTop || isSequence || expansion) {
      expansions.push(expansion);
    }
  }));

  return expansions;
}
