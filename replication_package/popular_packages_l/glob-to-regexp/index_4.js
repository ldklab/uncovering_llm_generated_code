function globToRegExp(glob, options = {}) {
  const { extended = false, globstar = false, flags = '' } = options;
  
  let regExp = '^';
  let inGroup = false;
  let charSetOpen = false;
  
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    switch (char) {
      case '/':
        regExp += '/';
        break;
      case '*':
        if (globstar && glob[i + 1] === '*') {
          regExp += '.*';
          i++;
        } else {
          regExp += '[^/]*';
        }
        break;
      case '?':
        regExp += extended ? '.' : '\\?';
        break;
      case '[':
        regExp += extended ? (charSetOpen = true, char) : '\\[';
        break;
      case ']':
        regExp += extended && charSetOpen ? (charSetOpen = false, char) : '\\]';
        break;
      case '{':
        regExp += extended ? (inGroup = true, '(') : '\\{';
        break;
      case '}':
        regExp += extended && inGroup ? (inGroup = false, ')') : '\\}';
        break;
      case ',':
        regExp += extended && inGroup ? '|' : '\\,';
        break;
      case '.':
      case '+':
      case '^':
      case '$':
      case '(':
      case ')':
      case '|':
      case '\\':
        regExp += '\\' + char;
        break;
      default:
        regExp += char;
    }
  }
  
  regExp += '$';
  return new RegExp(regExp, flags);
}

module.exports = globToRegExp;
