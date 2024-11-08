module.exports = exports = abbrev.abbrev = abbrev;

abbrev.monkeyPatch = monkeyPatch;

function monkeyPatch() {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function() {
      return abbrev(this);
    },
    enumerable: false, configurable: true, writable: true
  });

  Object.defineProperty(Object.prototype, 'abbrev', {
    value: function() {
      return abbrev(Object.keys(this));
    },
    enumerable: false, configurable: true, writable: true
  });
}

function abbrev(list) {
  if (arguments.length !== 1 || !Array.isArray(list)) {
    list = Array.prototype.slice.call(arguments, 0);
  }
  
  let args = list.map(item => typeof item === "string" ? item : String(item));
  
  // Sort them lexicographically
  args.sort(lexSort);

  let abbrevs = {};
  let prev = "";

  for (let i = 0, l = args.length; i < l; i++) {
    let current = args[i];
    let next = args[i + 1] || "";
    let nextMatches = true;
    let prevMatches = true;

    if (current === next) continue;

    let j = 0;
    let cl = current.length;

    while (j < cl) {
      let curChar = current.charAt(j);
      nextMatches = nextMatches && curChar === next.charAt(j);
      prevMatches = prevMatches && curChar === prev.charAt(j);
      
      if (!nextMatches && !prevMatches) {
        j++;
        break;
      }
      
      j++;
    }
    
    prev = current;
    if (j === cl) {
      abbrevs[current] = current;
      continue;
    }

    for (let a = current.substr(0, j); j <= cl; j++) {
      abbrevs[a] = current;
      a += current.charAt(j);
    }
  }

  return abbrevs;
}

function lexSort(a, b) {
  return a === b ? 0 : (a > b ? 1 : -1);
}