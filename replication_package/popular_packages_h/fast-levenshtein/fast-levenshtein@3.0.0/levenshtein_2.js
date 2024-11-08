'use strict';

const { distance } = require('fastest-levenshtein');

let collator;
try {
  collator = (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') 
    ? new Intl.Collator('generic', { sensitivity: 'base' }) 
    : null;
} catch (error) {
  console.log('Collator could not be initialized and will not be used');
}

const Levenshtein = {
  get: function(str1, str2, options) {
    const useCollator = options && collator && options.useCollator;

    if (useCollator) {
      const str1Len = str1.length;
      const str2Len = str2.length;

      if (str1Len === 0) return str2Len;
      if (str2Len === 0) return str1Len;

      let currRowVal, nextRowVal;
      const str2Chars = Array(str2Len).fill(0).map((_, i) => str2.charCodeAt(i));
      const prevRow = Array(str2Len + 1).fill(0).map((_, i) => i);
      
      for (let i = 0; i < str1Len; ++i) {
        nextRowVal = i + 1;

        for (let j = 0; j < str2Len; ++j) {
          currRowVal = nextRowVal;

          const isSameChar = collator.compare(str1.charAt(i), String.fromCharCode(str2Chars[j])) === 0;
          nextRowVal = Math.min(
            prevRow[j] + (isSameChar ? 0 : 1), // Substitution
            currRowVal + 1, // Insertion
            prevRow[j + 1] + 1 // Deletion
          );

          prevRow[j] = currRowVal;
        }

        prevRow[str2Len] = nextRowVal;
      }
      return nextRowVal;
    } 

    return distance(str1, str2);
  }
};

if (typeof define !== 'undefined' && define.amd) {
  define(() => Levenshtein);
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = Levenshtein;
} else if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.Levenshtein = Levenshtein;
} else if (typeof window !== 'undefined') {
  window.Levenshtein = Levenshtein;
}
