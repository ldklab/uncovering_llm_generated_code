/*
 * @version    1.4.0
 * @date       2015-10-26
 * @stability  3 - Stable
 * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
 * @license    MIT License
 */

function naturalCompare(a, b) {
  let i, codeA;
  let codeB = 1;
  let posA = 0;
  let posB = 0;
  const alphabet = String.alphabet;

  function getCode(str, pos, code) {
    if (code) {
      for (i = pos; (code = getCode(str, i)), code < 76 && code > 65;) ++i;
      return +str.slice(pos - 1, i);
    }
    code = alphabet ? alphabet.indexOf(str.charAt(pos)) : -1;
    if (code > -1) return code + 76;
    code = str.charCodeAt(pos) || 0;
    if (code < 45 || code > 127) return code;
    if (code < 46) return 65;  // -
    if (code < 48) return code - 1;
    if (code < 58) return code + 18;  // 0-9
    if (code < 65) return code - 11;
    if (code < 91) return code + 11;  // A-Z
    if (code < 97) return code - 37;
    if (code < 123) return code + 5;  // a-z
    return code - 63;
  }

  if ((a += "") != (b += "")) {
    while (codeB) {
      codeA = getCode(a, posA++);
      codeB = getCode(b, posB++);

      if (codeA < 76 && codeB < 76 && codeA > 66 && codeB > 66) {
        codeA = getCode(a, posA, posA);
        codeB = getCode(b, posB, (posA = i));
        posB = i;
      }

      if (codeA != codeB) return codeA < codeB ? -1 : 1;
    }
  }
  return 0;
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = naturalCompare;
} else {
  String.naturalCompare = naturalCompare;
}
