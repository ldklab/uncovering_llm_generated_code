// regenerate.js
class Regenerate {
  constructor(...values) {
    this.codePoints = new Set();
    this.add(...values);
  }

  // Method to add code points from given values.
  add(...values) {
    values.flat().forEach(value => this.codePoints.add(this._getCodePoint(value)));
    return this;
  }

  // Method to remove code points defined by the provided values.
  remove(...values) {
    values.flat().forEach(value => this.codePoints.delete(this._getCodePoint(value)));
    return this;
  }

  // Method to add a range of code points from start to end.
  addRange(start, end) {
    start = this._getCodePoint(start);
    end = this._getCodePoint(end);
    for (let cp = start; cp <= end; cp++) {
      this.codePoints.add(cp);
    }
    return this;
  }

  // Method to remove a range of code points from start to end.
  removeRange(start, end) {
    start = this._getCodePoint(start);
    end = this._getCodePoint(end);
    for (let cp = start; cp <= end; cp++) {
      this.codePoints.delete(cp);
    }
    return this;
  }

  // Method to keep only the intersection of this set with another set.
  intersection(otherSet) {
    const otherPoints = otherSet instanceof Regenerate ? otherSet.toArray() : otherSet;
    this.codePoints.forEach(cp => {
      if (!otherPoints.includes(cp)) {
        this.codePoints.delete(cp);
      }
    });
    return this;
  }

  // Method to check if a specific value is in the set.
  contains(value) {
    return this.codePoints.has(this._getCodePoint(value));
  }

  // Method to clone this Regenerate instance into a new one.
  clone() {
    const clonedSet = new Regenerate();
    clonedSet.add([...this.codePoints]);
    return clonedSet;
  }

  // Method to convert the stored code points into a string, optionally with unicode flag styling.
  toString(options = {}) {
    let sortedPoints = [...this.codePoints].sort((a, b) => a - b);
    if (options.hasUnicodeFlag) {
      return `[${sortedPoints.map(cp => `\\u{${cp.toString(16)}}`).join('')}]`;
    }
    return `[${sortedPoints.map(cp => `\\u${cp.toString(16).padStart(4, '0')}`).join('')}]`;
  }

  // Method to create a RegExp object based on the stored code points.
  toRegExp(flags = '') {
    return new RegExp(this.toString(), flags);
  }

  // Method to convert the stored code points into an array.
  toArray() {
    return [...this.codePoints];
  }

  // Helper method to get the code point of a character or validate a number.
  _getCodePoint(value) {
    if (typeof value === 'string') {
      return value.codePointAt(0);
    }
    return value; // assuming it's already a number
  }
}

// Static property to indicate the version of the Regenerate class.
Regenerate.version = "1.0.0";

// Export the Regenerate class as a module.
module.exports = Regenerate;
