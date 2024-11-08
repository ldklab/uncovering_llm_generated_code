jsx
module.exports = exports = function abbrev(list) {
  if (arguments.length !== 1 || !Array.isArray(list)) {
    list = [].slice.call(arguments);
  }
  const args = list.map(item => typeof item === "string" ? item : String(item)).sort(lexSort);

  const abbrevs = {};
  let prev = "";

  for (let i = 0; i < args.length; i++) {
    const current = args[i];
    const next = args[i + 1] || "";
    let nextMatches = true;
    let prevMatches = true;
    
    if (current === next) continue;

    let j;
    for (j = 0; j < current.length; j++) {
      const curChar = current.charAt(j);
      nextMatches = nextMatches && curChar === next.charAt(j);
      prevMatches = prevMatches && curChar === prev.charAt(j);
      if (!nextMatches && !prevMatches) break;
    }

    prev = current;
    if (j === current.length) {
      abbrevs[current] = current;
      continue;
    }

    for (let a = current.substr(0, j); j <= current.length; j++) {
      abbrevs[a] = current;
      a += current.charAt(j) || '';
    }
  }
  return abbrevs;
};

module.exports.monkeyPatch = function monkeyPatch() {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function() { return abbrev(this); },
    enumerable: false,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(Object.prototype, 'abbrev', {
    value: function() { return abbrev(Object.keys(this)); },
    enumerable: false,
    configurable: true,
    writable: true,
  });
};

function lexSort(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
