// The purpose of this code is to compute the differences between two strings, tokenized by characters, using a simple version of Myers' diff algorithm. It can also optionally ignore case when comparing characters.

class Diff {
  constructor() {
    this.ignoreCase = false; // Option to ignore case in comparison
  }
  
  // Tokenizes the string by splitting it into an array of characters
  tokenize(value) {
    return [...value];
  }
  
  // Computes the list of differences between the old and new strings
  diff(oldStr, newStr, options = {}) {
    this.ignoreCase = options.ignoreCase || false; // Set the ignoreCase option
    const oldTokens = this.tokenize(oldStr);
    const newTokens = this.tokenize(newStr);
    const changes = [];
    let i = 0, j = 0;
  
    // Traverse both strings and find differences
    while (i < oldTokens.length && j < newTokens.length) {
      if (this.equals(oldTokens[i], newTokens[j])) {
        changes.push({ value: oldTokens[i], count: 1 });
        i++; j++;
      } else {
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
  
    // Capture remaining characters if any
    while (i < oldTokens.length) {
      changes.push({ value: oldTokens[i], removed: true, count: 1 });
      i++;
    }
  
    while (j < newTokens.length) {
      changes.push({ value: newTokens[j], added: true, count: 1 });
      j++;
    }
  
    return changes;
  }
  
  // Check equality of two characters with optional case insensitivity
  equals(left, right) {
    if (this.ignoreCase) {
      return left.toLowerCase() === right.toLowerCase();
    }
    return left === right;
  }
  
  // Checks if an array contains a character, considering case sensitivity
  contains(array, item) {
    return array.some(element => this.equals(element, item));
  }
  
  // Static method to create a new diff instance and find char differences
  static diffChars(oldStr, newStr, options = {}) {
    const diff = new Diff();
    return diff.diff(oldStr, newStr, options);
  }
}

// Example Usage: displays differences in colored output
const diff = Diff.diffChars('beep boop', 'beep boob blah', { ignoreCase: false });
diff.forEach(part => {
  const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[0m';
  process.stdout.write(`${color}${part.value}\x1b[0m`);
});

module.exports = Diff;
