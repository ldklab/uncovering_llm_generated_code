(function() {
  'use strict';
  
  let collator;
  try {
    collator = (typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined") ? 
      Intl.Collator("generic", { sensitivity: "base" }) : null;
  } catch (error) {
    console.log("Collator could not be initialized and wouldn't be used");
  }

  const levenshtein = require('fastest-levenshtein');

  // Arrays for reuse in calculations
  const prevRow = [];
  const str2Char = [];

  const Levenshtein = {
    /**
     * Calculate the Levenshtein distance between two strings.
     * 
     * @param {string} str1 The first string.
     * @param {string} str2 The second string.
     * @param {Object} [options] Additional options.
     * @param {boolean} [options.useCollator] Use Intl.Collator for locale-sensitive string comparison.
     * @returns {number} The Levenshtein distance.
     */
    get: function(str1, str2, options) {
      const useCollator = options && collator && options.useCollator;

      if (useCollator) {
        const str1Len = str1.length;
        const str2Len = str2.length;

        if (str1Len === 0) return str2Len;
        if (str2Len === 0) return str1Len;

        let curCol, nextCol, tmp;

        for (let i = 0; i < str2Len; i++) {
          prevRow[i] = i;
          str2Char[i] = str2.charCodeAt(i);
        }
        prevRow[str2Len] = str2Len;

        for (let i = 0; i < str1Len; i++) {
          nextCol = i + 1;

          for (let j = 0; j < str2Len; j++) {
            curCol = nextCol;
            const strCmp = collator.compare(str1.charAt(i), String.fromCharCode(str2Char[j])) === 0;
            nextCol = prevRow[j] + (strCmp ? 0 : 1);

            tmp = curCol + 1;
            if (nextCol > tmp) nextCol = tmp;

            tmp = prevRow[j + 1] + 1;
            if (nextCol > tmp) nextCol = tmp;

            prevRow[j] = curCol;
          }
          prevRow[str2Len] = nextCol;
        }
        return nextCol;
      }
      return levenshtein.distance(str1, str2);
    }
  };

  if (typeof define !== "undefined" && define.amd) {
    define(() => Levenshtein);
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = Levenshtein;
  } else if (typeof self !== "undefined" && typeof self.postMessage === 'function' && typeof self.importScripts === 'function') {
    self.Levenshtein = Levenshtein;
  } else if (typeof window !== "undefined") {
    window.Levenshtein = Levenshtein;
  }
})();
