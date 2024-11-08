// Exports the primary abbreviation function so it can be used in other modules
exports = module.exports = abbrev;

// Adds abbreviation capabilities to arrays and objects
abbrev.monkeyPatch = monkeyPatch;

// Function to add the abbrev method to array and object prototypes
function monkeyPatch() {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function () { return abbrev(this) },
    enumerable: false, configurable: true, writable: true
  });

  Object.defineProperty(Object.prototype, 'abbrev', {
    value: function () { return abbrev(Object.keys(this)) },
    enumerable: false, configurable: true, writable: true
  });
}

// Main function for generating abbreviations
function abbrev(list) {
  // Check if the argument is an array, if not, convert arguments to an array
  if (arguments.length !== 1 || !Array.isArray(list)) {
    list = Array.prototype.slice.call(arguments, 0);
  }
  
  // Convert the list elements to strings
  var args = list.map(item => typeof item === "string" ? item : String(item));

  // Sort the input lexicographically
  args.sort(lexSort);

  // Process the sorted list to generate abbreviations
  var abbrevs = {};
  var prev = "";
  for (let i = 0, l = args.length; i < l; i++) {
    const current = args[i];
    const next = args[i + 1] || "";
    let nextMatches = true;
    let prevMatches = true;

    if (current === next) continue;

    let j = 0;
    for (j; j < current.length; j++) {
      const curChar = current.charAt(j);
      nextMatches = nextMatches && curChar === next.charAt(j);
      prevMatches = prevMatches && curChar === prev.charAt(j);
      if (!nextMatches && !prevMatches) {
        j++;
        break;
      }
    }
    prev = current;
    if (j === current.length) {
      abbrevs[current] = current;
      continue;
    }
    for (let a = current.substr(0, j); j <= current.length; j++) {
      abbrevs[a] = current;
      a += current.charAt(j);
    }
  }
  return abbrevs;
}

// Lexicographic sort for strings
function lexSort(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}