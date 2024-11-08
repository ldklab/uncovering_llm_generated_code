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
    const [startPoint, endPoint] = [this._getCodePoint(start), this._getCodePoint(end)];
    for (let cp = startPoint; cp <= endPoint; cp++) this.codePoints.add(cp);
    return this;
  }

  removeRange(start, end) {
    const [startPoint, endPoint] = [this._getCodePoint(start), this._getCodePoint(end)];
    for (let cp = startPoint; cp <= endPoint; cp++) this.codePoints.delete(cp);
    return this;
  }

  intersection(otherSet) {
    const otherPoints = otherSet instanceof Regenerate ? otherSet.toArray() : otherSet;
    this.codePoints.forEach(cp => {
      if (!otherPoints.includes(cp)) this.codePoints.delete(cp);
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
    const sortedPoints = [...this.codePoints].sort((a, b) => a - b);
    return `[${sortedPoints.map(cp => options.hasUnicodeFlag ? `\\u{${cp.toString(16)}}` : `\\u${cp.toString(16).padStart(4, '0')}`).join('')}]`;
  }

  toRegExp(flags = '') {
    return new RegExp(this.toString(), flags);
  }

  toArray() {
    return [...this.codePoints];
  }

  _getCodePoint(value) {
    return typeof value === 'string' ? value.codePointAt(0) : value;
  }
}

Regenerate.version = "1.0.0";

module.exports = Regenerate;
