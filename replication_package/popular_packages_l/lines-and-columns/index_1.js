// lines-and-columns/index.js

class LinesAndColumns {
  constructor(text) {
    this.text = text;
    this.lineStartIndices = this._computeLineStartIndices(text);
  }

  _computeLineStartIndices(text) {
    const lineStartIndices = [0];
    let searchIndex = 0;

    while ((searchIndex = text.indexOf('\n', searchIndex)) !== -1) {
      lineStartIndices.push(++searchIndex);
    }

    return lineStartIndices;
  }

  locationForIndex(index) {
    if (index < 0 || index >= this.text.length) return null;

    const lineNumber = this._findLineForIndex(index);
    if (lineNumber === -1) return null;

    const column = index - this.lineStartIndices[lineNumber];
    return { line: lineNumber, column };
  }

  _findLineForIndex(index) {
    for (let i = 0; i < this.lineStartIndices.length; i++) {
      if (index < (this.lineStartIndices[i + 1] || Infinity)) return i;
    }
    return -1;
  }

  indexForLocation({ line, column }) {
    if (line < 0 || line >= this.lineStartIndices.length) return null;

    const lineStartIndex = this.lineStartIndices[line];
    const index = lineStartIndex + column;

    if (index >= this.text.length || (line < this.lineStartIndices.length - 1 && index >= this.lineStartIndices[line + 1])) {
      return null;
    }

    return index;
  }
}

export { LinesAndColumns };
