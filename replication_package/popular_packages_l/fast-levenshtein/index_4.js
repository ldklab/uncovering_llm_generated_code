const Intl = require('intl');

class FastLevenshtein {
  static get(str1, str2, options = {}) {
    // Determine if Intl.Collator should be used based on options
    const useCollator = options.useCollator || false;
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

    // Normalize strings if using collator
    if (useCollator) {
      str1 = str1.normalize('NFC');
      str2 = str2.normalize('NFC');
    }

    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array.from({ length: len1 + 1 }, () => []);

    // Initialize the matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Compute the Levenshtein distance
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        // Determine the cost of substitution
        const cost = useCollator ? collator.compare(str1[i - 1], str2[j - 1]) : str1[i - 1] === str2[j - 1] ? 0 : 1;

        // Calculate the minimum cost for operations
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // Deletion
          matrix[i][j - 1] + 1,    // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    // Return the Levenshtein distance between the two strings
    return matrix[len1][len2];
  }
}

module.exports = FastLevenshtein;
