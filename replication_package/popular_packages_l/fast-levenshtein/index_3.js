// Import the Intl module to use Intl.Collator for locale-aware comparison
const Intl = require('intl');

class FastLevenshtein {
  // Static method to calculate Levenshtein distance
  static get(str1, str2, options = {}) {
    // Determine whether to use collator based on options
    const useCollator = options.useCollator || false;
    // Create a new collator for locale-aware comparison if needed
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

    // Normalize the strings if collator is used
    if (useCollator) {
      str1 = str1.normalize('NFC');
      str2 = str2.normalize('NFC');
    }

    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Initialize the first row and first column of the matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Compute the matrix values based on string comparison
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = useCollator
          ? collator.compare(str1[i - 1], str2[j - 1])
          : str1[i - 1] === str2[j - 1]
          ? 0
          // Cost of substitution is 1 when characters are different
          : 1;

        // Calculate the minimum cost by considering insertion, deletion, and substitution
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Insertion
          matrix[i][j - 1] + 1, // Deletion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }
    // Return the Levenshtein distance (last element in the matrix)
    return matrix[len1][len2];
  }
}

// Export the FastLevenshtein class as a module
module.exports = FastLevenshtein;
