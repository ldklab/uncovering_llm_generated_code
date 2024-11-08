function stringify(obj, opts = {}) {
  if (typeof opts === 'function') {
    opts = { cmp: opts };
  }

  const { cmp, space, replacer } = opts;
  const comparator = cmp ? (a, b) => cmp({ key: a[0], value: a[1] }, { key: b[0], value: b[1] }) : undefined;

  function _stringify(value) {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return '[' + value.map(_stringify).join(',') + ']';
    }

    const keys = Object.keys(value).sort(comparator);
    const keyValues = keys.map(key => JSON.stringify(key) + ':' + _stringify(value[key]));
    return '{' + keyValues.join(',') + '}';
  }

  function applyReplacer(value, replFunc, key = '') {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((item, idx) => applyReplacer(item, replFunc, idx));
      } else {
        return Object.keys(value).reduce((acc, curKey) => {
          acc[curKey] = applyReplacer(value[curKey], replFunc, curKey);
          return acc;
        }, {});
      }
    }
    return replFunc(key, value);
  }

  if (replacer) {
    obj = applyReplacer(obj, replacer);
  }

  let jsonString = _stringify(obj);
  return space ? formatPretty(jsonString, space) : jsonString;
}

function formatPretty(jsonStr, space) {
  const spaceStr = typeof space === 'number' ? ' '.repeat(space) : space;
  let indentLevel = 0;

  return jsonStr.replace(/({|}|\[|])|("(?:\\"|[^"])*"|\d+|true|false|null)|(:|,)/g, function (match, braces, value, separator) {
    if (braces) {
      if (braces === '{' || braces === '[') {
        return braces + '\n' + spaceStr.repeat(++indentLevel);
      }
      return '\n' + spaceStr.repeat(--indentLevel) + braces;
    }
    if (separator === ':') {
      return separator + ' ';
    }
    return separator || value || '';
  });
}

module.exports = stringify;
