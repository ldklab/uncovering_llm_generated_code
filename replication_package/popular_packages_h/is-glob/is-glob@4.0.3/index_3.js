var isExtglob = require('is-extglob');

// Mapping of opening to closing characters for check pairs
var chars = { '{': '}', '(': ')', '[': ']' };

// Function to strictly check if a pattern is glob
var strictCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (str[index] === '*' || (str[index + 1] === '?' && /[\].+)]/.test(str[index]))) {
      return true;
    }
    if (str[index] === '[' && str[index + 1] !== ']') {
      var closeIndex = str.indexOf(']', index);
      if (closeIndex > index && str.indexOf('\\', index) > closeIndex) {
        return true;
      }
    }
    if (str[index] === '{' && str[index + 1] !== '}') {
      var closeIndex = str.indexOf('}', index);
      if (closeIndex > index && str.indexOf('\\', index) > closeIndex) {
        return true;
      }
    }
    if (str[index] === '(' && str[index + 1] === '?' && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ')') {
      var closeIndex = str.indexOf(')', index);
      if (closeIndex > index && str.indexOf('\\', index) > closeIndex) {
        return true;
      }
    }
    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];
      if (close) {
        index = str.indexOf(close, index);
        if (index !== -1) {
          index++;
        }
      }
      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

// Function to relaxed check if a pattern is glob
var relaxedCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) {
      return true;
    }
    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];
      if (close) {
        index = str.indexOf(close, index);
        if (index !== -1) {
          index++;
        }
      }
      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

// Main function to check if the string is a glob pattern
module.exports = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }
  if (isExtglob(str)) {
    return true;
  }

  var check = options && options.strict === false ? relaxedCheck : strictCheck;
  return check(str);
};
