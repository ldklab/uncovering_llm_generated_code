module.exports = function(glob, opts = {}) {
  if (typeof glob !== 'string') {
    throw new TypeError('Expected a string');
  }

  let reStr = '';
  const extended = Boolean(opts.extended);
  const globstar = Boolean(opts.globstar);
  let inGroup = false;
  const flags = typeof opts.flags === 'string' ? opts.flags : '';

  for (let i = 0, len = glob.length; i < len; i++) {
    const c = glob[i];

    switch (c) {
      case '/':
      case '$':
      case '^':
      case '+':
      case '.':
      case '(':
      case ')':
      case '=':
      case '!':
      case '|':
        reStr += `\\${c}`;
        break;
      case '?':
        reStr += extended ? '.' : `\\${c}`;
        break;
      case '[':
      case ']':
        reStr += extended ? c : `\\${c}`;
        break;
      case '{':
        if (extended) {
          inGroup = true;
          reStr += '(';
        } else {
          reStr += `\\${c}`;
        }
        break;
      case '}':
        reStr += inGroup && extended ? ')' : `\\${c}`;
        inGroup = false;
        break;
      case ',':
        reStr += inGroup ? '|' : `\\${c}`;
        break;
      case '*':
        const prevChar = glob[i - 1];
        let starCount = 1;
        
        while (glob[i + 1] === '*') {
          starCount++;
          i++;
        }
        
        const nextChar = glob[i + 1];
        if (!globstar) {
          reStr += '.*';
        } else {
          const isGlobstar = starCount > 1 && (prevChar === '/' || !prevChar) && (nextChar === '/' || !nextChar);
          reStr += isGlobstar ? '((?:[^/]*(?:/|$))*)' : '([^/]*)';
          if (isGlobstar) i++;
        }
        break;
      default:
        reStr += c;
    }
  }

  if (!~flags.indexOf('g')) {
    reStr = `^${reStr}$`;
  }

  return new RegExp(reStr, flags);
};
