(function() {
  'use strict';
  
  const levenshtein = require('fastest-levenshtein');

  // Initialize collator if available
  const collator = (() => {
    try {
      if (typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined") {
        return Intl.Collator("generic", { sensitivity: "base" });
      }
    } catch (err) {
      console.log("Collator could not be initialized and wouldn't be used");
    }
    return null;
  })();

  const prevRow = [],
    str2Char = [];

  const Levenshtein = {
    get: function(str1, str2, options = {}) {
      const useCollator = options.useCollator && collator;
      
      if (useCollator) {
        const [str1Len, str2Len] = [str1.length, str2.length];
        if (str1Len === 0) return str2Len;
        if (str2Len === 0) return str1Len;

        for (let i = 0; i < str2Len; ++i) {
          prevRow[i] = i;
          str2Char[i] = str2.charCodeAt(i);
        }
        prevRow[str2Len] = str2Len;

        let nextCol;
        for (let i = 0; i < str1Len; ++i) {
          nextCol = i + 1;
          for (let j = 0; j < str2Len; ++j) {
            const curCol = nextCol;
            const strCmp = collator.compare(str1.charAt(i), String.fromCharCode(str2Char[j])) === 0;
            nextCol = Math.min(prevRow[j] + (strCmp ? 0 : 1), curCol + 1, prevRow[j + 1] + 1);
            prevRow[j] = curCol;
          }
          prevRow[str2Len] = nextCol;
        }
        return nextCol;
      }
      return levenshtein.distance(str1, str2);
    }
  };

  if (typeof define === "function" && define.amd) {
    define(() => Levenshtein);
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = Levenshtein;
  } else if (typeof self !== "undefined" && self.postMessage && self.importScripts) {
    self.Levenshtein = Levenshtein;
  } else if (typeof window !== "undefined") {
    window.Levenshtein = Levenshtein;
  }
})();
