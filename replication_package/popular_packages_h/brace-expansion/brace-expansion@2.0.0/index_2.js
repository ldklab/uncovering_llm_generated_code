const balanced = require('balanced-match');

module.exports = expandTop;

const escSlash = '\0SLASH' + Math.random() + '\0';
const escOpen = '\0OPEN' + Math.random() + '\0';
const escClose = '\0CLOSE' + Math.random() + '\0';
const escComma = '\0COMMA' + Math.random() + '\0';
const escPeriod = '\0PERIOD' + Math.random() + '\0';

function numeric(str) {
  const num = parseInt(str, 10);
  return num == str ? num : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.replace(/\\\\/g, escSlash)
            .replace(/\\\{/g, escOpen)
            .replace(/\\\}/g, escClose)
            .replace(/\\,/g, escComma)
            .replace(/\\\./g, escPeriod);
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

  const pre = m.pre.split(',');
  pre[pre.length - 1] += `{${m.body}}`;

  const postParts = parseCommaParts(m.post);
  if (m.post.length) {
    pre[pre.length - 1] += postParts.shift();
    pre.push(...postParts);
  }

  parts.push(...pre);

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
  return `{${str}}`;
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
      return expand(`${m.pre}{${m.body}${escClose}${m.post}`);
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
        return post.map(p => `${m.pre}${n[0]}${p}`);
      }
    }
  }

  const pre = m.pre;
  const post = m.post.length ? expand(m.post, false) : [''];

  let N;

  if (isSequence) {
    const x = numeric(n[0]);
    const y = numeric(n[1]);
    const width = Math.max(n[0].length, n[1].length);
    let incr = n.length === 3 ? Math.abs(numeric(n[2])) : 1;
    let test = lte;
    let reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    const pad = n.some(isPadded);

    N = [];

    for (let i = x; test(i, y); i += incr) {
      let c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\') c = '';
      } else {
        c = String(i);
        if (pad) {
          const need = width - c.length;
          if (need > 0) {
            const z = '0'.repeat(need);
            c = i < 0 ? `-${z}${c.slice(1)}` : z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = [];
    for (let j = 0; j < n.length; j++) {
      N.push(...expand(n[j], false));
    }
  }

  for (let j = 0; j < N.length; j++) {
    for (let k = 0; k < post.length; k++) {
      const expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion) expansions.push(expansion);
    }
  }

  return expansions;
}
