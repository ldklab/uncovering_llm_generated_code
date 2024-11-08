function stringify(obj, opts = {}) {
  opts = typeof opts === 'function' ? { cmp: opts } : opts;
  const space = opts.space || '';
  const hasComparator = typeof opts.cmp === 'function';
  const comparator = hasComparator 
    ? (a, b) => opts.cmp({ key: a[0], value: a[1] }, { key: b[0], value: b[1] })
    : undefined;

  function _stringify(obj) {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return `[${obj.map(_stringify).join(',')}]`;
    }
    
    const keys = Object.keys(obj).sort(comparator);
    const keyValues = keys.map(key => `${JSON.stringify(key)}:${_stringify(obj[key])}`);
    return `{${keyValues.join(',')}}`;
  }
  
  if (opts.replacer) {
    obj = replace(obj, opts.replacer);
  }

  const result = _stringify(obj);
  return space ? prettyPrint(result, space) : result;
}

function replace(obj, replacer, key = '') {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => replace(item, replacer, index));
    } else {
      return Object.keys(obj).reduce((acc, currentKey) => {
        acc[currentKey] = replace(obj[currentKey], replacer, currentKey);
        return acc;
      }, {});
    }
  }
  return replacer(key, obj);
}

function prettyPrint(jsonString, space) {
  const spaceStr = typeof space === 'number' ? ' '.repeat(space) : space;
  let indent = 0;
  return jsonString.replace(/({|}|\[|])|("(?:\\"|[^"])*"|\d+|true|false|null)|(:|,)/g, (match, braces, value, separator) => {
    if (braces) {
      if (braces === '{' || braces === '[') {
        return `${braces}\n${spaceStr.repeat(++indent)}`;
      }
      return `\n${spaceStr.repeat(--indent)}${braces}`;
    }
    if (separator === ':') {
      return `${separator} `;
    }
    return separator || value || '';
  });
}

module.exports = stringify;
