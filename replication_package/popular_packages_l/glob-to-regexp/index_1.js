function globToRegExp(glob, options = {}) {
  const { extended = false, globstar = false, flags = '' } = options;
  let regExpString = '^';
  let inGroup = false;
  let charSet = false;

  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];

    if (char === '/') {
      regExpString += '/';
    } else if (char === '*') {
      if (glob[i + 1] === '*' && globstar) {
        regExpString += '.*';
        i++;
      } else {
        regExpString += '[^/]*';
      }
    } else if (char === '?') {
      regExpString += extended ? '.' : '\\?';
    } else if (char === '[') {
      if (extended) {
        charSet = true;
        regExpString += char;
      } else {
        regExpString += '\\[';
      }
    } else if (char === ']') {
      if (extended && charSet) {
        charSet = false;
        regExpString += char;
      } else {
        regExpString += '\\]';
      }
    } else if (char === '{') {
      if (extended) {
        inGroup = true;
        regExpString += '(';
      } else {
        regExpString += '\\{';
      }
    } else if (char === '}') {
      if (extended && inGroup) {
        inGroup = false;
        regExpString += ')';
      } else {
        regExpString += '\\}';
      }
    } else if (char === ',') {
      if (extended && inGroup) {
        regExpString += '|';
      } else {
        regExpString += '\\,';
      }
    } else if ('+^$()|\\'.includes(char)) {
      regExpString += '\\' + char;
    } else {
      regExpString += char;
    }
  }

  regExpString += '$';
  return new RegExp(regExpString, flags);
}

module.exports = globToRegExp;
