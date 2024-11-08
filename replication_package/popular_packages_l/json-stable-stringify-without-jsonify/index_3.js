function stringify(obj, options = {}) {
  options = typeof options === 'function' ? { cmp: options } : options;
  const { space = '', cmp: comparatorFn, replacer } = options;
  const comparator = comparatorFn && ((a, b) => comparatorFn({ key: a[0], value: a[1] }, { key: b[0], value: b[1] }));

  function serialize(obj) {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) return `[${obj.map(serialize).join(',')}]`;

    const keys = Object.keys(obj).sort(comparator);
    const keyVals = keys.map(key => `${JSON.stringify(key)}:${serialize(obj[key])}`);
    return `{${keyVals.join(',')}}`;
  }

  function applyReplacer(obj, replacer, key = '') {
    if (typeof obj !== 'object' || obj === null) return replacer(key, obj);

    if (Array.isArray(obj)) {
      return obj.map((el, idx) => applyReplacer(el, replacer, idx));
    }

    return Object.keys(obj).reduce((result, currentKey) => {
      result[currentKey] = applyReplacer(obj[currentKey], replacer, currentKey);
      return result;
    }, {});
  }

  function formatJson(jsonString, space) {
    const spacing = typeof space === 'number' ? ' '.repeat(space) : space;
    let indentLevel = 0;
    
    return jsonString.replace(/({|}|\[|])|("(?:\\"|[^"])*"|\d+|true|false|null)|(:|,)/g, (match, braces, value, separator) => {
      if (braces) {
        if (braces === '{' || braces === '[') return `${braces}\n${spacing.repeat(++indentLevel)}`;
        return `\n${spacing.repeat(--indentLevel)}${braces}`;
      }
      if (separator === ':') return ': ';
      return separator || value;
    });
  }

  if (replacer) {
    obj = applyReplacer(obj, replacer);
  }

  const jsonString = serialize(obj);
  return space ? formatJson(jsonString, space) : jsonString;
}

module.exports = stringify;
