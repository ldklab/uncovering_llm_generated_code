module.exports = abbrev;

// Main abbrev function
function abbrev(list) {
  if (arguments.length !== 1 || !Array.isArray(list)) {
    list = Array.from(arguments);
  }
  
  const args = list.map(item => typeof item === "string" ? item : String(item));
  args.sort(lexSort);
  
  const abbrevs = {};
  let prev = "";
  
  for (let i = 0; i < args.length; i++) {
    const current = args[i], next = args[i + 1] || "";
    if (current === next) continue;
    
    let nextMatches = true, prevMatches = true, j = 0;
    while (j < current.length && (nextMatches || prevMatches)) {
      const curChar = current.charAt(j);
      nextMatches = nextMatches && curChar === next.charAt(j);
      prevMatches = prevMatches && curChar === prev.charAt(j);
      
      if (!nextMatches && !prevMatches) break;
      j++;
    }
    
    prev = current;
    
    if (j === current.length) {
      abbrevs[current] = current;
    } else {
      let abbrevStr = current.substring(0, j);
      while (j <= current.length) {
        abbrevs[abbrevStr] = current;
        abbrevStr += current.charAt(j) || '';
        j++;
      }
    }
  }
  
  return abbrevs;
}

// Lexical sort function
function lexSort(a, b) {
  return a.localeCompare(b);
}

// Monkey patch function
function monkeyPatch() {
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
}

// Attach monkeyPatch method to abbrev
abbrev.monkeyPatch = monkeyPatch;