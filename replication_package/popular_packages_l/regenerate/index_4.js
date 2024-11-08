// regenerate.js
class Regenerate {
  constructor(...values) {
    this.codePoints = new Set();
    this.add(...values);
  }

  add(...values) {
    values.flat().forEach(value => this.codePoints.add(this._extractCodePoint(value)));
    return this;
  }

  remove(...values) {
    values.flat().forEach(value => this.codePoints.delete(this._extractCodePoint(value)));
    return this;
  }

  addRange(start, end) {
    const startCode = this._extractCodePoint(start);
    const endCode = this._extractCodePoint(end);
    for (let codePoint = startCode; codePoint <= endCode; codePoint++) {
      this.codePoints.add(codePoint);
    }
    return this;
  }

  removeRange(start, end) {
    const startCode = this._extractCodePoint(start);
    const endCode = this._extractCodePoint(end);
    for (let codePoint = startCode; codePoint <= endCode; codePoint++) {
      this.codePoints.delete(codePoint);
    }
    return this;
  }

  intersection(otherSet) {
    const otherCodePoints = otherSet instanceof Regenerate ? otherSet.toArray() : otherSet;
    this.codePoints.forEach(cp => {
      if (!otherCodePoints.includes(cp)) {
        this.codePoints.delete(cp);
      }
    });
    return this;
  }

  contains(value) {
    return this.codePoints.has(this._extractCodePoint(value));
  }

  clone() {
    const cloned = new Regenerate();
    cloned.add([...this.codePoints]);
    return cloned;
  }

  toString(options = {}) {
    const sortedCodePoints = [...this.codePoints].sort((a, b) => a - b);
    if (options.hasUnicodeFlag) {
      return `[${sortedCodePoints.map(cp => `\\u{${cp.toString(16)}}`).join('')}]`;
    }
    return `[${sortedCodePoints.map(cp => `\\u${cp.toString(16).padStart(4, '0')}`).join('')}]`;
  }

  toRegExp(flags = '') {
    return new RegExp(this.toString(), flags);
  }

  toArray() {
    return [...this.codePoints];
  }

  _extractCodePoint(value) {
    return typeof value === 'string' ? value.codePointAt(0) : value;
  }
}

Regenerate.version = "1.0.0";

module.exports = Regenerate;
