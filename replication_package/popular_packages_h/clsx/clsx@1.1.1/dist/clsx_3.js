function stringifyValue(value) {
  let result = '';

  if (typeof value === 'string' || typeof value === 'number') {
    result += value;
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      for (let item of value) {
        const processed = stringifyValue(item);
        if (processed) {
          if (result) result += ' ';
          result += processed;
        }
      }
    } else {
      for (const key in value) {
        if (value[key]) {
          if (result) result += ' ';
          result += key;
        }
      }
    }
  }

  return result;
}

module.exports = function (...args) {
  let result = '';

  for (const arg of args) {
    const processed = stringifyValue(arg);
    if (processed) {
      if (result) result += ' ';
      result += processed;
    }
  }

  return result;
}
