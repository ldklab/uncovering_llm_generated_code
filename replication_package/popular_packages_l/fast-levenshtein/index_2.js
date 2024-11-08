const Intl = require('intl'); // Ensure Intl is available

class FastLevenshtein {
  static get(str1, str2, options = {}) {
    const useCollator = options.useCollator || false;
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

    if (useCollator) {
      str1 = str1.normalize('NFC');
      str2 = str2.normalize('NFC');
    }

    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        let cost;
        if (useCollator) {
          cost = collator.compare(str1[i - 1], str2[j - 1]) === 0 ? 0 : 1;
        } else {
          cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        }

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[len1][len2];
  }
}

module.exports = FastLevenshtein;
