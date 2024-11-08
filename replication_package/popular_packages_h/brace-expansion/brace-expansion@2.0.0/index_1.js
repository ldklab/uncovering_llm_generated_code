var balanced = require('balanced-match');

module.exports = expandTop;

const escChars = {
  slash:  `\0SLASH${Math.random()}\0`,
  open:   `\0OPEN${Math.random()}\0`,
  close:  `\0CLOSE${Math.random()}\0`,
  comma:  `\0COMMA${Math.random()}\0`,
  period: `\0PERIOD${Math.random()}\0`,
};

function numeric(str) {
  const num = parseInt(str, 10);
  return num == str ? num : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str
    .replace(/\\\\/g, escChars.slash)
    .replace(/\\\{/g, escChars.open)
    .replace(/\\\}/g, escChars.close)
    .replace(/\\,/g, escChars.comma)
    .replace(/\\\./g, escChars.period);
}

function unescapeBraces(str) {
  return str
    .replace(new RegExp(escChars.slash, 'g'), '\\')
    .replace(new RegExp(escChars.open, 'g'), '{')
    .replace(new RegExp(escChars.close, 'g'), '}')
    .replace(new RegExp(escChars.comma, 'g'), ',')
    .replace(new RegExp(escChars.period, 'g'), '.');
}

function parseCommaParts(str) {
  if (!str) return [''];

  const m = balanced('{', '}', str);
  if (!m) return str.split(',');

  const pre = m.pre.split(',');
  pre[pre.length - 1] += '{' + m.body + '}';
  const postParts = parseCommaParts(m.post);

  if (m.post.length) {
    pre[pre.length - 1] += postParts.shift();
    return pre.concat(postParts);
  }

  return pre;
}

function expandTop(str) {
  if (!str) return [];

  if (str.startsWith('{}')) {
    str = '\\{\\}' + str.slice(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function expand(str, isTop) {
  const expansions = [];
  const m = balanced('{', '}', str);
  if (!m || m.pre.endsWith('$')) return [str];

  const isSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body) || /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  const isOptions = m.body.includes(',');
  if (!isSequence && !isOptions) {
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escChars.close + m.post;
      return expand(str);
    }
    return [str];
  }

  const elements = isSequence ? m.body.split(/\.\./) : parseCommaParts(m.body);
  if (!isSequence && elements.length === 1) {
    return expand(elements[0], false).map(embrace).concat(m.post.length ? expand(m.post, false) : ['']);
  }

  const pre = m.pre;
  const post = m.post.length ? expand(m.post, false) : [''];

  const rangeExpansion = isSequence ? expandSequence(elements, /^[a-zA-Z]\.\.[a-zA-Z]/.test(m.body)) : expandOptions(elements);

  for (const part of rangeExpansion) {
    for (const suffix of post) {
      const expansion = pre + part + suffix;
      if (!isTop || isSequence || expansion) expansions.push(expansion);
    }
  }

  return expansions;
}

function expandSequence(n, isAlpha) {
  const x = numeric(n[0]);
  const y = numeric(n[1]);
  const width = Math.max(n[0].length, n[1].length);
  const incr = n.length === 3 ? Math.abs(numeric(n[2])) : 1;
  const test = x <= y ? ((i, y) => i <= y) : ((i, y) => i >= y);
  const rangeIncrement = x <= y ? incr : -incr;
  const pad = n.some(isPadded);
  const range = [];

  for (let i = x; test(i, y); i += rangeIncrement) {
    let c;
    if (isAlpha) {
      c = String.fromCharCode(i);
      if (c === '\\') c = '';
    } else {
      c = (pad && i >= 0 ? '0'.repeat(width - String(i).length) : '') + i;
    }

    range.push(c);
  }

  return range;
}

function expandOptions(options) {
  return options.flatMap((option) => expand(option, false));
}

function isPadded(el) {
  return /^-?0\d/.test(el);
}

function embrace(str) {
  return `{${str}}`;
}
