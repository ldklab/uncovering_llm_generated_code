const Intl = require('intl'); // Ensure Intl is available for Node.js environments

class FastLevenshtein {
  static calculateDistance(str1, str2, options = {}) {
    const { useCollator = false } = options; // Extract useCollator from options
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

    if (useCollator) {
      str1 = str1.normalize('NFC');
      str2 = str2.normalize('NFC');
    }

    const len1 = str1.length;
    const len2 = str2.length;
    const distanceMatrix = Array.from({ length: len1 + 1 }, () => []);

    for (let i = 0; i <= len1; i++) {
      distanceMatrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      distanceMatrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const substitutionCost = useCollator
          ? collator.compare(str1[i - 1], str2[j - 1])
          : str1[i - 1] === str2[j - 1]
          ? 0
          : 1;

        distanceMatrix[i][j] = Math.min(
          distanceMatrix[i - 1][j] + 1,  // Deletion
          distanceMatrix[i][j - 1] + 1,  // Insertion
          distanceMatrix[i - 1][j - 1] + substitutionCost  // Substitution
        );
      }
    }

    return distanceMatrix[len1][len2];
  }
}

module.exports = FastLevenshtein;
