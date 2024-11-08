module.exports = function(glob, opts = {}) {
  if (typeof glob !== 'string') {
    throw new TypeError('Expected a string');
  }

  let reStr = '';
  const extended = opts.extended === true;
  const globstar = opts.globstar === true;
  const flags = typeof opts.flags === 'string' ? opts.flags : '';
  
  const escapeChar = char => `\\${char}`;
  let inGroup = false;

  for (let i = 0; i < glob.length; i++) {
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
        reStr += escapeChar(c);
        break;
      case '?':
        reStr += extended ? '.' : escapeChar(c);
        break;
      case '[':
      case ']':
        reStr += extended ? c : escapeChar(c);
        break;
      case '{':
        if (extended) {
          inGroup = true;
          reStr += '(';
        }
        break;
      case '}':
        if (extended) {
          inGroup = false;
          reStr += ')';
        }
        break;
      case ',':
        reStr += inGroup ? '|' : escapeChar(c);
        break;
      case '*':
        let prevChar = glob[i - 1];
        let starCount = 1;
        while (glob[i + 1] === '*') {
          starCount++;
          i++;
        }
        let nextChar = glob[i + 1];
        if (!globstar) {
          reStr += '.*';
        } else {
          const isGlobstar = starCount > 1 &&
            (prevChar === '/' || prevChar === undefined) &&
            (nextChar === '/' || nextChar === undefined);

          if (isGlobstar) {
            reStr += '((?:[^/]*(?:\/|$))*)';
            i++;
          } else {
            reStr += '([^/]*)';
          }
        }
        break;
      default:
        reStr += c;
    }
  }

  if (!flags.includes('g')) {
    reStr = `^${reStr}$`;
  }

  return new RegExp(reStr, flags);
};
