const eol = (typeof process !== 'undefined' && process.platform === 'win32') ? '\r\n' : '\n';

function encode(obj, options) {
  let output = '';
  const children = [];
  
  if (typeof options === 'string') {
    options = { section: options, whitespace: false };
  } else {
    options = options || {};
    options.whitespace = options.whitespace === true;
  }

  const separator = options.whitespace ? ' = ' : '=';

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        output += formatKeyVal(safe(key + '[]'), item, separator);
      }
    } else if (value && typeof value === 'object') {
      children.push(key);
    } else {
      output += formatKeyVal(safe(key), value, separator);
    }
  }

  if (options.section && output.length) {
    output = `[${safe(options.section)}]${eol}${output}`;
  }

  for (const childKey of children) {
    const section = options.section ? `${options.section}.${childKey}` : childKey;
    const childOutput = encode(obj[childKey], { section, whitespace: options.whitespace });
    if (output.length && childOutput.length) output += eol;
    output += childOutput;
  }

  return output;
}

function formatKeyVal(key, value, separator) {
  return `${key}${separator}${safe(value)}${eol}`;
}

function decode(iniString) {
  const object = {};
  let currentSection = object;
  const sectionRe = /^\[([^\]]*)\]$/;
  const keyValueRe = /^([^=]+)(=(.*))?$/;

  const lines = iniString.split(/[\r\n]+/);
  for (const line of lines) {
    if (!line || /^\s*[;#]/.test(line)) continue;

    const sectionMatch = line.match(sectionRe);
    if (sectionMatch) {
      const sectionName = unsafe(sectionMatch[1]);
      if (sectionName === '__proto__') {
        currentSection = {};
      } else {
        currentSection = object[sectionName] = object[sectionName] || {};
      }
      continue;
    }

    const kvMatch = line.match(keyValueRe);
    if (!kvMatch) continue;

    const key = unsafe(kvMatch[1]);
    const isArrayKey = key.endsWith('[]');
    const actualKey = isArrayKey ? key.slice(0, -2) : key;

    if (actualKey === '__proto__') continue;

    const value = kvMatch[2] ? parseValue(unsafe(kvMatch[3])) : true;

    if (isArrayKey) {
      if (!Array.isArray(currentSection[actualKey])) {
        currentSection[actualKey] = currentSection.hasOwnProperty(actualKey) ? [currentSection[actualKey]] : [];
      }
      currentSection[actualKey].push(value);
    } else {
      currentSection[actualKey] = value;
    }
  }

  flattenDotKeys(object);

  return object;
}

function flattenDotKeys(obj) {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] !== 'object' || Array.isArray(obj[key])) continue;
    const parts = dotSplit(key);
    let target = obj;
    while (parts.length > 1) {
      const part = parts.shift();
      if (!target.hasOwnProperty(part) || typeof target[part] !== 'object') target[part] = {};
      target = target[part];
    }
    target[parts[0]] = obj[key];
    delete obj[key];
  }
}

function dotSplit(str) {
  return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
    .replace(/\\\./g, '\u0001')
    .split(/\./)
    .map(part => part.replace(/\1/g, '\\.').replace(/\2LITERAL\\1LITERAL\2/g, '\u0001'));
}

function parseValue(value) {
  if (['true', 'false', 'null'].includes(value)) {
    return JSON.parse(value);
  }
  return value;
}

function safe(val) {
  if (typeof val !== 'string' || /[=\r\n]/.test(val) || /^\[/.test(val) || 
      (val.length > 1 && isQuoted(val)) || val !== val.trim()) {
    return JSON.stringify(val);
  }
  return val.replace(/;/g, '\\;').replace(/#/g, '\\#');
}

function unsafe(val) {
  let trimmed = (val || '').trim();
  if (isQuoted(trimmed)) {
    if (trimmed.charAt(0) === "'") trimmed = trimmed.slice(1, -1);
    try {
      return JSON.parse(trimmed);
    } catch (_) {}
  } else {
    let unescaped = '';
    let escaping = false;
    for (let i = 0; i < trimmed.length; i++) {
      if (escaping) {
        unescaped += '\\;#'.includes(trimmed[i]) ? trimmed[i] : '\\' + trimmed[i];
        escaping = false;
      } else if (';#'.includes(trimmed[i])) {
        break;
      } else if (trimmed[i] === '\\') {
        escaping = true;
      } else {
        unescaped += trimmed[i];
      }
    }
    return unescaped;
  }
  return trimmed;
}

function isQuoted(val) {
  return (val.charAt(0) === '"' && val.slice(-1) === '"') || (val.charAt(0) === "'" && val.slice(-1) === "'");
}

module.exports = {
  parse: decode,
  decode: decode,
  stringify: encode,
  encode: encode,
  safe: safe,
  unsafe: unsafe,
};
