// regenerate.js
class Regenerate {
  constructor(...values) {
    this.codePoints = new Set();
    this.add(...values);
  }

  add(...values) {
    values.flat().forEach(value => this.codePoints.add(this._toCodePoint(value)));
    return this;
  }

  remove(...values) {
    values.flat().forEach(value => this.codePoints.delete(this._toCodePoint(value)));
    return this;
  }

  addRange(start, end) {
    [start, end] = [this._toCodePoint(start), this._toCodePoint(end)];
    for (let cp = start; cp <= end; cp++) {
      this.codePoints.add(cp);
    }
    return this;
  }

  removeRange(start, end) {
    [start, end] = [this._toCodePoint(start), this._toCodePoint(end)];
    for (let cp = start; cp <= end; cp++) {
      this.codePoints.delete(cp);
    }
    return this;
  }

  intersection(other) {
    const otherPoints = other instanceof Regenerate ? other.toArray() : other;
    this.codePoints.forEach(cp => {
      if (!otherPoints.includes(cp)) {
        this.codePoints.delete(cp);
      }
    });
    return this;
  }

  contains(value) {
    return this.codePoints.has(this._toCodePoint(value));
  }

  clone() {
    return new Regenerate(...this.toArray());
  }

  toString(options = {}) {
    const sorted = [...this.codePoints].sort((a, b) => a - b);
    return `[${sorted.map(cp => options.hasUnicodeFlag ? `\\u{${cp.toString(16)}}` : `\\u${cp.toString(16).padStart(4, '0')}`).join('')}]`;
  }

  toRegExp(flags = '') {
    return new RegExp(this.toString(), flags);
  }

  toArray() {
    return [...this.codePoints];
  }

  _toCodePoint(value) {
    return typeof value === 'string' ? value.codePointAt(0) : value;
  }
}

Regenerate.version = "1.0.0";

module.exports = Regenerate;
