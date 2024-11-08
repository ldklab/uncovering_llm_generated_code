function globToRegExp(glob, options = {}) {
  const extended = options.extended || false;
  const globstar = options.globstar || false;
  const flags = options.flags || '';

  let regExpString = '^';
  let inGroup = false;
  let charSet = false;
  
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];

    switch (char) {
      case '/':
        regExpString += '/';
        break;
      case '*':
        const nextChar = glob[i + 1];
        if (nextChar === '*' && globstar) {
          regExpString += '.*';
          i++;
        } else {
          regExpString += '[^/]*';
        }
        break;
      case '?':
        if (extended) {
          regExpString += '.';
        } else {
          regExpString += '\\?';
        }
        break;
      case '[':
        if (extended) {
          charSet = true;
          regExpString += char;
        } else {
          regExpString += '\\[';
        }
        break;
      case ']':
        if (extended && charSet) {
          charSet = false;
          regExpString += char;
        } else {
          regExpString += '\\]';
        }
        break;
      case '{':
        if (extended) {
          inGroup = true;
          regExpString += '(';
        } else {
          regExpString += '\\{';
        }
        break;
      case '}':
        if (extended && inGroup) {
          inGroup = false;
          regExpString += ')';
        } else {
          regExpString += '\\}';
        }
        break;
      case ',':
        if (extended && inGroup) {
          regExpString += '|';
        } else {
          regExpString += '\\,';
        }
        break;
      case '.':
      case '+':
      case '^':
      case '$':
      case '(':
      case ')':
      case '|':
      case '\\':
        regExpString += '\\' + char;
        break;
      default:
        regExpString += char;
    }
  }

  regExpString += '$';
  return new RegExp(regExpString, flags);
}

module.exports = globToRegExp;
```
