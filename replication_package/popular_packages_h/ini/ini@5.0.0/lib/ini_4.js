const { hasOwnProperty } = Object.prototype;

const encode = (obj, opt = {}) => {
  opt = typeof opt === 'string' ? { section: opt } : opt;
  const { align = false, newline = false, sort = false, whitespace = align, bracketedArray = true } = opt;
  const platform = opt.platform || (typeof process !== 'undefined' && process.platform);
  const eol = platform === 'win32' ? '\r\n' : '\n';
  const separator = whitespace ? ' = ' : '=';
  const children = [];
  const keys = (sort ? Object.keys(obj).sort() : Object.keys(obj));

  const padToChars = align
    ? safe(keys.filter(k => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== 'object')
      .map(k => Array.isArray(obj[k]) ? `${k}[]` : k).concat(['']).reduce((a, b) => safe(a).length >= safe(b).length ? a : b)).length
    : 0;

  let out = '';
  const arraySuffix = bracketedArray ? '[]' : '';

  for (const k of keys) {
    const val = obj[k];
    if (Array.isArray(val)) {
      for (const item of val) {
        out += safe(`${k}${arraySuffix}`).padEnd(padToChars, ' ') + separator + safe(item) + eol;
      }
    } else if (val && typeof val === 'object') {
      children.push(k);
    } else {
      out += safe(k).padEnd(padToChars, ' ') + separator + safe(val) + eol;
    }
  }

  if (opt.section && out.length) {
    out = `[${safe(opt.section)}]${newline ? eol + eol : eol}${out}`;
  }

  for (const k of children) {
    const section = `${opt.section ? `${opt.section}.` : ''}${splitSections(k, '.').join('\\.')}`;
    const child = encode(obj[k], { ...opt, section });
    if (out.length && child.length) {
      out += eol;
    }
    out += child;
  }

  return out;
};

const splitSections = (str, separator) => {
  const sections = [];
  let lastMatchIndex, lastSeparatorIndex = 0, nextIndex;

  do {
    nextIndex = str.indexOf(separator, lastMatchIndex);
    if (nextIndex !== -1 && (nextIndex === 0 || str[nextIndex - 1] !== '\\')) {
      sections.push(str.slice(lastSeparatorIndex, nextIndex));
      lastSeparatorIndex = nextIndex + separator.length;
    }
    lastMatchIndex = nextIndex + separator.length;
  } while (nextIndex !== -1);

  sections.push(str.slice(lastSeparatorIndex));
  return sections;
};

const decode = (str, opt = {}) => {
  const bracketedArray = (opt.bracketedArray !== false);
  const out = Object.create(null);
  const lines = str.split(/[\r\n]+/g);
  let p = out;
  let section = null;
  const duplicates = {};
  const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i;

  for (const line of lines) {
    if (!line || line.match(/^\s*[;#]/)) {
      continue;
    }
    const match = line.match(re);
    if (!match) {
      continue;
    }
    if (match[1] !== undefined) {
      section = unsafe(match[1]);
      if (section === '__proto__') {
        p = Object.create(null);
        continue;
      }
      p = out[section] = out[section] || Object.create(null);
      continue;
    }
    const keyRaw = unsafe(match[2]);
    const isArray = bracketedArray ? keyRaw.endsWith('[]') : (duplicates[keyRaw] = (duplicates[keyRaw] || 0) + 1) > 1;
    const key = isArray ? keyRaw.slice(0, -2) : keyRaw;
    if (key === '__proto__') continue;

    const valueRaw = match[3] ? unsafe(match[4]) : true;
    const value = ['true', 'false', 'null'].includes(valueRaw) ? JSON.parse(valueRaw) : valueRaw;

    if (isArray) {
      if (!hasOwnProperty.call(p, key)) {
        p[key] = [];
      } else if (!Array.isArray(p[key])) {
        p[key] = [p[key]];
      }
    }
    if (Array.isArray(p[key])) {
      p[key].push(value);
    } else {
      p[key] = value;
    }
  }

  const remove = [];
  for (const k of Object.keys(out)) {
    if (typeof out[k] !== 'object' || Array.isArray(out[k])) continue;
    const parts = splitSections(k, '.');
    p = out;
    const l = parts.pop().replace(/\\\./g, '.');
    for (const part of parts) {
      if (part === '__proto__') continue;
      if (!hasOwnProperty.call(p, part) || typeof p[part] !== 'object') {
        p[part] = Object.create(null);
      }
      p = p[part];
    }
    if (p !== out || l !== k) {
      p[l] = out[k];
      remove.push(k);
    }
  }
  for (const del of remove) {
    delete out[del];
  }

  return out;
};

const isQuoted = val => (/^(['"])(.*)\1$/).test(val);
const safe = val => {
  if (
    typeof val !== 'string' ||
    val.match(/[=\r\n]/) ||
    val.match(/^\[/) ||
    (/^(["']).*\1$/).test(val) ||
    val !== val.trim()
  ) {
    return JSON.stringify(val);
  }
  return val.replace(/;/g, '\\;').replace(/#/g, '\\#');
};

const unsafe = val => {
  val = (val || '').trim();
  if (isQuoted(val)) {
    val = val.startsWith("'") ? val.slice(1, -1) : val;
    try {
      val = JSON.parse(val);
    } catch {}
  } else {
    let unesc = '';
    for (let i = 0, esc = false; i < val.length; i++) {
      const c = val.charAt(i);
      if (esc) {
        unesc += '\\;#'.includes(c) ? c : `\\${c}`;
        esc = false;
      } else if (';#'.includes(c)) {
        break;
      } else if (c === '\\') {
        esc = true;
      } else {
        unesc += c;
      }
    }
    return unesc.trim();
  }
  return val;
};

module.exports = {
  parse: decode,
  decode,
  stringify: encode,
  encode,
  safe,
  unsafe,
};
