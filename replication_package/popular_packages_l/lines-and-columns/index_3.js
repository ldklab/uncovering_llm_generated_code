class LinesAndColumns {
  constructor(text) {
    this.text = text;
    this.lineStartIndices = this._computeLineStartIndices(text);
  }

  _computeLineStartIndices(text) {
    const indices = [0];
    let position = 0;
    while ((position = text.indexOf('\n', position)) !== -1) {
      indices.push(++position);
    }
    return indices;
  }

  locationForIndex(index) {
    if (index < 0 || index >= this.text.length) return null;
    let line = this.lineStartIndices.findIndex((start, i) => 
      index < (this.lineStartIndices[i + 1] || Infinity)
    );
    let column = index - this.lineStartIndices[line];
    return { line, column };
  }

  indexForLocation({ line, column }) {
    if (line < 0 || line >= this.lineStartIndices.length) return null;
    let startIndex = this.lineStartIndices[line];
    let index = startIndex + column;
    if (index >= this.text.length || (line < this.lineStartIndices.length - 1 && index >= this.lineStartIndices[line + 1])) {
      return null;
    }
    return index;
  }
}

export { LinesAndColumns };
