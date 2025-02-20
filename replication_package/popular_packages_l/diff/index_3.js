class Diff {
  constructor() {
    // Initialize the ignoreCase property to false.
    this.ignoreCase = false;
  }

  // Split the input string into an array of individual characters.
  tokenize(value) {
    return [...value];
  }

  // Calculate the differences between oldStr and newStr using a simplified diff algorithm.
  diff(oldStr, newStr, options = {}) {
    // Set ignoreCase property based on the options provided.
    this.ignoreCase = options.ignoreCase || false;
    
    // Tokenize both input strings to arrays of characters.
    const oldTokens = this.tokenize(oldStr);
    const newTokens = this.tokenize(newStr);

    // Array to hold the difference changes.
    const changes = [];
    let i = 0, j = 0;

    // Traverse both token arrays, comparing each character.
    while (i < oldTokens.length && j < newTokens.length) {
      if (this.equals(oldTokens[i], newTokens[j])) {
        // Characters match; record it.
        changes.push({ value: oldTokens[i], count: 1 });
        i++; j++;
      } else {
        // Find diverging tokens and determine added or removed changes.
        let oldIndex = i, newIndex = j;
        while (oldIndex < oldTokens.length && !this.contains(newTokens, oldTokens[oldIndex])) {
          changes.push({ value: oldTokens[oldIndex], removed: true, count: 1 });
          oldIndex++;
        }
        while (newIndex < newTokens.length && !this.contains(oldTokens, newTokens[newIndex])) {
          changes.push({ value: newTokens[newIndex], added: true, count: 1 });
          newIndex++;
        }
        i = oldIndex;
        j = newIndex;
      }
    }

    // Capture any remaining characters from oldTokens as removed.
    while (i < oldTokens.length) {
      changes.push({ value: oldTokens[i], removed: true, count: 1 });
      i++;
    }

    // Capture any remaining characters from newTokens as added.
    while (j < newTokens.length) {
      changes.push({ value: newTokens[j], added: true, count: 1 });
      j++;
    }

    // Return the calculated list of changes.
    return changes;
  }

  // Compare two characters considering ignoreCase.
  equals(left, right) {
    if (this.ignoreCase) {
      return left.toLowerCase() === right.toLowerCase();
    }
    return left === right;
  }

  // Check if the array contains a specific character, considering ignoreCase.
  contains(array, item) {
    return array.some(element => this.equals(element, item));
  }

  // Expose the diff function as a static method to be used directly.
  static diffChars(oldStr, newStr, options = {}) {
    const diff = new Diff();
    return diff.diff(oldStr, newStr, options);
  }
}

// Example usage of the Diff class to compare two strings and output differences with colors.
const diff = Diff.diffChars('beep boop', 'beep boob blah', { ignoreCase: false });
diff.forEach(part => {
  const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[0m';
  process.stdout.write(`${color}${part.value}\x1b[0m`);
});

module.exports = Diff;
