class Diff {
  constructor() {
    this.ignoreCase = false;
  }
  
  // Tokenizes input by characters
  tokenize(value) {
    return [...value];
  }
  
  // This is the diffing function using a simplified version of Myers' algorithm
  diff(oldStr, newStr, options = {}) {
    this.ignoreCase = options.ignoreCase || false;
    const oldTokens = this.tokenize(oldStr);
    const newTokens = this.tokenize(newStr);
  
    const changes = [];
    let i = 0, j = 0;
  
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
  
  equals(left, right) {
    if (this.ignoreCase) {
      return left.toLowerCase() === right.toLowerCase();
    }
    return left === right;
  }
  
  contains(array, item) {
    return array.some(element => this.equals(element, item));
  }
  
  // Main diff function to expose
  static diffChars(oldStr, newStr, options = {}) {
    const diff = new Diff();
    return diff.diff(oldStr, newStr, options);
  }
}

// Example Usage
const diff = Diff.diffChars('beep boop', 'beep boob blah', { ignoreCase: false });
diff.forEach(part => {
  const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[0m';
  process.stdout.write(`${color}${part.value}\x1b[0m`);
});

module.exports = Diff;
