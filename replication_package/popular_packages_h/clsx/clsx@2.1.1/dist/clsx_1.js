function processItem(item) {
  let result = "";
  
  if (typeof item === 'string' || typeof item === 'number') {
    result += item;
  } else if (typeof item === 'object') {
    if (Array.isArray(item)) {
      for (let i = 0; i < item.length; i++) {
        if (item[i]) {
          const processed = processItem(item[i]);
          if (processed) {
            if (result) result += " ";
            result += processed;
          }
        }
      }
    } else {
      for (const key in item) {
        if (item[key]) {
          if (result) result += " ";
          result += key;
        }
      }
    }
  }

  return result;
}

function combineStrings() {
  let combined = "";
  
  for (let i = 0; i < arguments.length; i++) {
    const item = arguments[i];
    if (item) {
      const processed = processItem(item);
      if (processed) {
        if (combined) combined += " ";
        combined += processed;
      }
    }
  }
  
  return combined;
}

module.exports = combineStrings;
module.exports.clsx = combineStrings;
