// regenerate.js
class Regenerate {
  constructor(...values) {
    this.codePoints = new Set();
    this.add(...values);
  }

  add(...values) {
    values.flat().forEach(value => this.codePoints.add(this._getCodePoint(value)));
    return this;
  }

  remove(...values) {
    values.flat().forEach(value => this.codePoints.delete(this._getCodePoint(value)));
    return this;
  }

  addRange(start, end) {
    start = this._getCodePoint(start);
    end = this._getCodePoint(end);
    for (let cp = start; cp <= end; cp++) {
      this.codePoints.add(cp);
    }
    return this;
  }

  removeRange(start, end) {
    start = this._getCodePoint(start);
    end = this._getCodePoint(end);
    for (let cp = start; cp <= end; cp++) {
      this.codePoints.delete(cp);
    }
    return this;
  }

  intersection(otherSet) {
    const otherPoints = otherSet instanceof Regenerate ? otherSet.toArray() : otherSet;
    this.codePoints.forEach(cp => {
      if (!otherPoints.includes(cp)) {
        this.codePoints.delete(cp);
      }
    });
    return this;
  }

  contains(value) {
    return this.codePoints.has(this._getCodePoint(value));
  }

  clone() {
    const clonedSet = new Regenerate();
    clonedSet.add([...this.codePoints]);
    return clonedSet;
  }

  toString(options = {}) {
    let sortedPoints = [...this.codePoints].sort((a, b) => a - b);
    if (options.hasUnicodeFlag) {
      return `[${sortedPoints.map(cp => `\\u{${cp.toString(16)}}`).join('')}]`;
    }
    return `[${sortedPoints.map(cp => `\\u${cp.toString(16).padStart(4, '0')}`).join('')}]`;
  }

  toRegExp(flags = '') {
    return new RegExp(this.toString(), flags);
  }

  toArray() {
    return [...this.codePoints];
  }

  _getCodePoint(value) {
    if (typeof value === 'string') {
      return value.codePointAt(0);
    }
    return value;
  }
}

Regenerate.version = "1.0.0";

module.exports = Regenerate;
