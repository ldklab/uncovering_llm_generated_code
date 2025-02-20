const { hasOwnProperty } = Object.prototype;

function encode(obj, opt = {}) {
  // Handle options and defaults
  if (typeof opt === 'string') {
    opt = { section: opt };
  }
  opt = {
    align: opt.align === true,
    newline: opt.newline === true,
    sort: opt.sort === true,
    whitespace: opt.whitespace === true || opt.align === true,
    platform: opt.platform || (typeof process !== 'undefined' && process.platform),
    bracketedArray: opt.bracketedArray !== false,
  };

  const eol = opt.platform === 'win32' ? '\r\n' : '\n';
  const separator = opt.whitespace ? ' = ' : '=';
  const children = [];
  const keys = opt.sort ? Object.keys(obj).sort() : Object.keys(obj);
  let padToChars = 0;

  // Calculate padding for alignment
  if (opt.align) {
    padToChars = safe(
      keys
        .filter(k => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== 'object')
        .map(k => Array.isArray(obj[k]) ? `${k}[]` : k)
        .concat([''])
        .reduce((a, b) => safe(a).length >= safe(b).length ? a : b)
    ).length;
  }

  let out = '';
  const arraySuffix = opt.bracketedArray ? '[]' : '';

  // Process each key-value pair
  for (const k of keys) {
    const val = obj[k];
    if (val && Array.isArray(val)) {
      for (const item of val) {
        out += safe(`${k}${arraySuffix}`).padEnd(padToChars, ' ') + separator + safe(item) + eol;
      }
    } else if (val && typeof val === 'object') {
      children.push(k);
    } else {
      out += safe(k).padEnd(padToChars, ' ') + separator + safe(val) + eol;
    }
  }

  // Handle sections
  if (opt.section && out.length) {
    out = `[${safe(opt.section)}]${opt.newline ? eol + eol : eol}${out}`;
  }

  // Recurse into children
  for (const k of children) {
    const nk = splitSections(k, '.').join('\\.');
    const section = (opt.section ? opt.section + '.' : '') + nk;
    const child = encode(obj[k], { ...opt, section });
    if (out.length && child.length) {
      out += eol;
    }
    out += child;
  }

  return out;
}

function decode(str, opt = {}) {
  opt.bracketedArray = opt.bracketedArray !== false;
  const out = Object.create(null);
  let p = out;
  let section = null;
  const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i;
  const lines = str.split(/[\r\n]+/g);
  const duplicates = {};

  // Process lines
  for (const line of lines) {
    if (!line || line.match(/^\s*[;#]/) || line.match(/^\s*$/)) {
      continue;
    }
    const match = line.match(re);
    if (!match) {
      continue;
    }
    if (match[1] !== undefined) {
      section = unsafe(match[1]);
      if (section !== '__proto__') {
        p = out[section] = out[section] || Object.create(null);
      }
      continue;
    }
    const keyRaw = unsafe(match[2]);
    let isArray;
    if (opt.bracketedArray) {
      isArray = keyRaw.length > 2 && keyRaw.slice(-2) === '[]';
    } else {
      duplicates[keyRaw] = (duplicates[keyRaw] || 0) + 1;
      isArray = duplicates[keyRaw] > 1;
    }
    const key = isArray && keyRaw.endsWith('[]') ? keyRaw.slice(0, -2) : keyRaw;

    if (key !== '__proto__') {
      const valueRaw = match[3] ? unsafe(match[4]) : true;
      const value = ['true', 'false', 'null'].includes(valueRaw) ? JSON.parse(valueRaw) : valueRaw;
      
      if (isArray) {
        if (!hasOwnProperty.call(p, key)) {
          p[key] = [];
        }
        if (!Array.isArray(p[key])) {
          p[key] = [p[key]];
        }
      }
      if (Array.isArray(p[key])) {
        p[key].push(value);
      } else {
        p[key] = value;
      }
    }
  }

  // Handle nested structures
  const remove = [];
  for (const k of Object.keys(out)) {
    if (typeof out[k] !== 'object' || Array.isArray(out[k])) continue;

    const parts = splitSections(k, '.');
    p = out;
    const l = parts.pop();
    const nl = l.replace(/\\\./g, '.');
    for (const part of parts) {
      if (part !== '__proto__') {
        if (!hasOwnProperty.call(p, part)) {
          p[part] = Object.create(null);
        }
        p = p[part];
      }
    }

    if (p !== out || nl !== l) {
      p[nl] = out[k];
      remove.push(k);
    }
  }
  for (const del of remove) {
    delete out[del];
  }

  return out;
}

function splitSections(str, separator) {
  let lastMatchIndex = 0;
  let lastSeparatorIndex = 0;
  let nextIndex = 0;
  const sections = [];

  do {
    nextIndex = str.indexOf(separator, lastMatchIndex);
    if (nextIndex !== -1) {
      lastMatchIndex = nextIndex + separator.length;
      if (nextIndex > 0 && str[nextIndex - 1] === '\\') continue;
      sections.push(str.slice(lastSeparatorIndex, nextIndex));
      lastSeparatorIndex = nextIndex + separator.length;
    }
  } while (nextIndex !== -1);

  sections.push(str.slice(lastSeparatorIndex));
  return sections;
}

const isQuoted = val => (val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"));

function safe(val) {
  if (
    typeof val !== 'string' ||
    val.match(/[=\r\n]/) ||
    val.match(/^\[/) ||
    (val.length > 1 && isQuoted(val)) ||
    val !== val.trim()
  ) {
    return JSON.stringify(val);
  }
  return val.split(';').join('\\;').split('#').join('\\#');
}

function unsafe(val) {
  val = (val || '').trim();
  if (isQuoted(val)) {
    if (val.charAt(0) === "'") {
      val = val.slice(1, -1);
    }
    try {
      val = JSON.parse(val);
    } catch {
      // ignore errors
    }
  } else {
    let esc = false;
    let unesc = '';
    for (let i = 0, l = val.length; i < l; i++) {
      const c = val.charAt(i);
      if (esc) {
        if ('\\;#'.includes(c)) {
          unesc += c;
        } else {
          unesc += '\\' + c;
        }
        esc = false;
      } else if (';#'.includes(c)) {
        break;
      } else if (c === '\\') {
        esc = true;
      } else {
        unesc += c;
      }
    }
    if (esc) {
      unesc += '\\';
    }

    return unesc.trim();
  }
  return val;
}

module.exports = {
  parse: decode,
  decode,
  stringify: encode,
  encode,
  safe,
  unsafe,
};
