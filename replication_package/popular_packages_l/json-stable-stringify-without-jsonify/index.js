function stringify(obj, opts = {}) {
  opts = typeof opts === 'function' ? { cmp: opts } : opts;
  var space = opts.space || '';
  var comparator = opts.cmp && ((a, b) => opts.cmp({ key: a[0], value: a[1] }, { key: b[0], value: b[1] }));

  function _stringify(obj) {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(_stringify).join(',') + ']';
    }
    
    var keys = Object.keys(obj).sort(comparator);
    var keyValues = keys.map(key => JSON.stringify(key) + ':' + _stringify(obj[key]));
    return '{' + keyValues.join(',') + '}';
  }
  
  if (opts.replacer) {
    obj = replace(obj, opts.replacer);
  }

  var result = _stringify(obj);
  return space ? prettyPrint(result, space) : result;
}

function replace(obj, replacer, key = '') {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => replace(item, replacer, index));
    } else {
      return Object.keys(obj).reduce((res, currentKey) => {
        res[currentKey] = replace(obj[currentKey], replacer, currentKey);
        return res;
      }, {});
    }
  }
  return replacer(key, obj);
}

function prettyPrint(jsonString, space) {
  var spaceStr = typeof space === 'number' ? ' '.repeat(space) : space;
  var indent = 0;
  return jsonString
    .replace(/({|}|\[|])|("(?:\\"|[^"])*"|\d+|true|false|null)|(:|,)/g, function (match, braces, value, separator) {
      if (braces) {
        if (braces === '{' || braces === '[') {
          return braces + '\n' + spaceStr.repeat(++indent);
        }
        return '\n' + spaceStr.repeat(--indent) + braces;
      }
      if (separator && separator === ':') {
        return separator + ' ';
      }
      return separator || value || '';
    });
}

module.exports = stringify;
