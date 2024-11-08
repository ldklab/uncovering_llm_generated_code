module.exports = exports = function abbrev(list) {
  if (!Array.isArray(list)) {
    list = Array.from(arguments);
  }

  const args = list.map(item => String(item)).sort(lexSort);
  const abbrevs = {};
  
  let prev = "";
  args.forEach((current, i) => {
    const next = args[i + 1] || "";
    let nextMatches = true, prevMatches = true;
    
    if (current === next) return;
    
    let j;
    for (j = 0; j < current.length; j++) {
      const curChar = current[j];
      nextMatches = nextMatches && curChar === next[j];
      prevMatches = prevMatches && curChar === prev[j];
      if (!nextMatches && !prevMatches) {
        break;
      }
    }
    
    prev = current;
    
    if (j === current.length) {
      abbrevs[current] = current;
      return;
    }
    
    for (let a = current.substring(0, j); j <= current.length; j++) {
      abbrevs[a] = current;
      a += current[j];
    }
  });
  
  return abbrevs;
};

abbrev.monkeyPatch = function monkeyPatch() {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function() { return abbrev(this); },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(Object.prototype, 'abbrev', {
    value: function() { return abbrev(Object.keys(this)); },
    enumerable: false,
    configurable: true,
    writable: true
  });
};

function lexSort(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
