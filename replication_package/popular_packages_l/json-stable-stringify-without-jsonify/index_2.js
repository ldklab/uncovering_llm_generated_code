function stringify(obj, opts = {}) {
  if (typeof opts === 'function') opts = { cmp: opts };
  const space = opts.space || '';
  const comparator = opts.cmp 
    ? (a, b) => opts.cmp({ key: a[0], value: a[1] }, { key: b[0], value: b[1] }) 
    : undefined;

  function _stringify(obj) {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    
    if (Array.isArray(obj)) {
      return '[' + obj.map(_stringify).join(',') + ']';
    }

    const keys = Object.keys(obj).sort(comparator);
    const keyValues = keys.map(key => `${JSON.stringify(key)}:${_stringify(obj[key])}`);
    return `{${keyValues.join(',')}}`;
  }

  if (opts.replacer) {
    obj = applyReplacer(obj, opts.replacer);
  }

  const jsonString = _stringify(obj);
  return space ? formatPretty(jsonString, space) : jsonString;
}

function applyReplacer(obj, replacer, key = '') {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => applyReplacer(item, replacer, index));
    } else {
      return Object.keys(obj).reduce((acc, currentKey) => {
        acc[currentKey] = applyReplacer(obj[currentKey], replacer, currentKey);
        return acc;
      }, {});
    }
  }
  return replacer(key, obj);
}

function formatPretty(jsonString, space) {
  const indentation = typeof space === 'number' ? ' '.repeat(space) : space;
  let level = 0;
  
  return jsonString.replace(/({|}|\[|])|("(?:\\"|[^"])*"|\d+|true|false|null)|(:|,)/g, function (match, braces, value, separator) {
    if (braces) {
      if (braces === '{' || braces === '[') {
        return braces + '\n' + indentation.repeat(++level);
      }
      return '\n' + indentation.repeat(--level) + braces;
    }
    if (separator && separator === ':') {
      return separator + ' ';
    }
    return separator || value || '';
  });
}

module.exports = stringify;
