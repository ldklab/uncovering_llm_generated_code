module.exports = function (glob, opts = {}) {
  if (typeof glob !== 'string') {
    throw new TypeError('Expected a string');
  }

  let str = String(glob);
  let reStr = "";
  const extended = !!opts.extended;
  const globstar = !!opts.globstar;
  const flags = typeof opts.flags === "string" ? opts.flags : "";
  let inGroup = false;

  for (let i = 0; i < str.length; i++) {
    let c = str[i];

    switch (c) {
      case "/": case "$": case "^": case "+": case ".": 
      case "(": case ")": case "=": case "!": case "|":
        reStr += "\\" + c;
        break;
      
      case "?":
        reStr += extended ? "." : "\\" + c;
        break;

      case "[": case "]":
        reStr += extended ? c : "\\" + c;
        break;

      case "{":
        if (extended) {
          inGroup = true;
          reStr += "(";
          break;
        }
        reStr += "\\" + c;
        break;

      case "}":
        if (extended) {
          inGroup = false;
          reStr += ")";
          break;
        }
        reStr += "\\" + c;
        break;

      case ",":
        reStr += inGroup ? "|" : "\\" + c;
        break;

      case "*":
        let prevChar = str[i - 1];
        let starCount = 1;
        while (str[i + 1] === "*") {
          starCount++;
          i++;
        }
        let nextChar = str[i + 1];

        if (globstar) {
          const isGlobstar = starCount > 1 && (prevChar === "/" || !prevChar)
            && (nextChar === "/" || !nextChar);

          reStr += isGlobstar ? "((?:[^/]*(?:\\/|$))*)" : "([^/]*)";
          if (isGlobstar) i++; 
        } else {
          reStr += ".*";
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
