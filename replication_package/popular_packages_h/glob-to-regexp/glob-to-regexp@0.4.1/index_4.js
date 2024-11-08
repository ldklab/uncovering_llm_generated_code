module.exports = function (glob, opts) {
  if (typeof glob !== 'string') {
    throw new TypeError('Expected a string');
  }

  let reStr = '';
  const str = String(glob);
  const extended = opts ? !!opts.extended : false;
  const globstar = opts ? !!opts.globstar : false;
  let inGroup = false;
  const flags = opts && typeof opts.flags === 'string' ? opts.flags : '';
  let c;

  for (let i = 0, len = str.length; i < len; i++) {
    c = str[i];

    switch (c) {
      case "/":
      case "$":
      case "^":
      case "+":
      case ".":
      case "(":
      case ")":
      case "=":
      case "!":
      case "|":
        reStr += "\\" + c;
        break;
        
      case "?":
        reStr += extended ? "." : "\\?";
        break;
        
      case "[":
      case "]":
        reStr += extended ? c : "\\" + c;
        break;
        
      case "{":
        if (extended) {
          inGroup = true;
          reStr += "(";
        } else {
          reStr += "\\{";
        }
        break;
        
      case "}":
        if (extended) {
          inGroup = false;
          reStr += ")";
        } else {
          reStr += "\\}";
        }
        break;

      case ",":
        reStr += inGroup ? "|" : "\\,";
        break;

      case "*":
        let prevChar = str[i - 1];
        let starCount = 1;
        while (str[i + 1] === "*") {
          starCount++;
          i++;
        }
        let nextChar = str[i + 1];

        if (!globstar) {
          reStr += ".*";
        } else {
          let isGlobstar = starCount > 1 && (prevChar === "/" || prevChar === undefined) 
                            && (nextChar === "/" || nextChar === undefined);

          reStr += isGlobstar ? "((?:[^/]*(?:\/|$))*)" : "([^/]*)";

          if (isGlobstar) {
            i++; // Skip over the "/"
          }
        }
        break;

      default:
        reStr += c;
    }
  }

  if (!flags.includes('g')) {
    reStr = "^" + reStr + "$";
  }

  return new RegExp(reStr, flags);
};
