const eol = process.platform === 'win32' ? '\r\n' : '\n';

function encode(obj, options) {
  const childSections = [];
  let result = '';

  if (typeof options === 'string') {
    options = { section: options, whitespace: false };
  } else {
    options = options || {};
    options.whitespace = options.whitespace === true;
  }

  const separator = options.whitespace ? ' = ' : '=';

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        result += `${safe(key + '[]')}${separator}${safe(item)}${eol}`;
      }
    } else if (typeof value === 'object' && value !== null) {
      childSections.push(key);
    } else {
      result += `${safe(key)}${separator}${safe(value)}${eol}`;
    }
  }

  if (options.section && result) {
    result = `[${safe(options.section)}]${eol}${result}`;
  }

  for (const section of childSections) {
    const dottedSection = dotSplit(section).join('\\.');
    const fullSection = options.section ? `${options.section}.${dottedSection}` : dottedSection;
    const encodedChild = encode(obj[section], { section: fullSection, whitespace: options.whitespace });
    if (result && encodedChild) result += eol;
    result += encodedChild;
  }

  return result;
}

function decode(iniStr) {
  const result = {};
  let currentSection = result;
  let sectionName = null;
  const lineRegex = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/;

  iniStr.split(/[\r\n]+/).forEach(line => {
    if (!line || /^\s*[;#]/.test(line)) return;
    const match = line.match(lineRegex);
    if (!match) return;
    if (match[1]) {
      sectionName = unsafe(match[1]);
      if (sectionName === '__proto__') {
        currentSection = {};
        return;
      }
      currentSection = result[sectionName] = result[sectionName] || {};
    } else {
      const rawKey = unsafe(match[2]);
      const isArray = rawKey.endsWith('[]');
      const key = isArray ? rawKey.slice(0, -2) : rawKey;
      if (key === '__proto__') return;
      const rawValue = match[3] ? unsafe(match[4]) : true;
      const value = parseValue(rawValue);

      if (isArray) {
        if (!Array.isArray(currentSection[key])) {
          currentSection[key] = [];
        }
        currentSection[key].push(value);
      } else {
        currentSection[key] = value;
      }
    }
  });

  handleDotSections(result);
  return result;
}

function parseValue(value) {
  if (value === 'true' || value === 'false' || value === 'null') {
    return JSON.parse(value);
  }
  return value;
}

function handleDotSections(obj) {
  const keysToRemove = [];
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] !== 'object' || Array.isArray(obj[key])) continue;
    const parts = dotSplit(key);
    let target = obj;
    const lastPart = parts.pop().replace(/\\\./g, '.');
    for (const part of parts) {
      if (!target[part] || typeof target[part] !== 'object') {
        target[part] = {};
      }
      target = target[part];
    }
    target[lastPart] = obj[key];
    keysToRemove.push(key);
  }
  keysToRemove.forEach(key => delete obj[key]);
}

function safe(input) {
  if (typeof input !== 'string' || /[=\r\n]/.test(input) || /^\[/.test(input) || (input.length > 1 && isQuoted(input)) || input !== input.trim()) {
    return JSON.stringify(input);
  }
  return input.replace(/;/g, '\\;').replace(/#/g, '\\#');
}

function unsafe(input = '') {
  input = input.trim();
  if (isQuoted(input)) {
    if (input.startsWith("'")) input = input.slice(1, -1);
    try {
      return JSON.parse(input);
    } catch {
      // Do nothing
    }
  } else {
    let unescaped = '';
    let escapeNext = false;
    for (const char of input) {
      if (escapeNext) {
        unescaped += '\\;#'.includes(char) ? char : '\\' + char;
        escapeNext = false;
      } else if (';#'.includes(char)) {
        break;
      } else if (char === '\\') {
        escapeNext = true;
      } else {
        unescaped += char;
      }
    }
    if (escapeNext) unescaped += '\\';
    return unescaped.trim();
  }
  return input;
}

function dotSplit(str) {
  return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
            .replace(/\\\./g, '\u0001')
            .split('.')
            .map(segment => segment.replace(/\1/g, '\\.').replace(/\2LITERAL\\1LITERAL\2/g, '\u0001'));
}

function isQuoted(val) {
  return (val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"));
}

module.exports = {
  parse: decode,
  decode,
  stringify: encode,
  encode,
  safe,
  unsafe,
};
