'use strict';

module.exports = balanced;

function balanced(a, b, str) {
  // Convert if `a` or `b` are regex, find first match in `str`
  a = a instanceof RegExp ? matchRegex(a, str) : a;
  b = b instanceof RegExp ? matchRegex(b, str) : b;
  
  // Get range of first balanced occurrence
  const r = findRange(a, b, str);

  if (!r) return null;

  const [start, end] = r;
  return {
    start,
    end,
    pre: str.slice(0, start),
    body: str.slice(start + a.length, end),
    post: str.slice(end + b.length)
  };
}

function matchRegex(regex, str) {
  const match = str.match(regex);
  return match ? match[0] : null;
}

balanced.range = findRange;
function findRange(a, b, str) {
  let ai = str.indexOf(a);
  let bi = str.indexOf(b, ai + 1);
  let result = null;
  const starts = [];

  while (ai >= 0 && bi > 0 && !result) {
    if (ai === str.indexOf(a)) {
      starts.push(ai);
      ai = str.indexOf(a, ai + 1);
    } else if (starts.length === 1) {
      result = [starts.pop(), bi];
    } else {
      const lastStart = starts.pop();
      if (!result || lastStart < result[0]) {
        result = [lastStart, bi];
      }
      bi = str.indexOf(b, bi + 1);
    }
  }

  if (starts.length) {
    result = [starts[0], bi];
  }

  return result;
}
