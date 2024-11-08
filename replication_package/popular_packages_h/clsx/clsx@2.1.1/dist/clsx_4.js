function processElement(element) {
  let result = '';
  
  if (typeof element === 'string' || typeof element === 'number') {
    result += element;
  } else if (typeof element === 'object') {
    if (Array.isArray(element)) {
      for (const item of element) {
        if (item) {
          const itemResult = processElement(item);
          if (itemResult) {
            if (result) result += ' ';
            result += itemResult;
          }
        }
      }
    } else {
      for (const key in element) {
        if (element[key]) {
          if (result) result += ' ';
          result += key;
        }
      }
    }
  }
  
  return result;
}

function concatenateClasses(...args) {
  let result = '';
  
  for (const arg of args) {
    if (arg) {
      const argResult = processElement(arg);
      if (argResult) {
        if (result) result += ' ';
        result += argResult;
      }
    }
  }
  
  return result;
}

module.exports = concatenateClasses;
module.exports.clsx = concatenateClasses;
