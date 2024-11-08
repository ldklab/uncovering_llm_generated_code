class LinesAndColumns {
  constructor(text) {
    this.text = text;
    this.lineStartIndices = this._computeLineStartIndices(text);
  }

  _computeLineStartIndices(text) {
    const indices = [0];
    let currentPosition = 0;
    while ((currentPosition = text.indexOf('\n', currentPosition)) !== -1) {
      indices.push(++currentPosition);
    }
    return indices;
  }

  locationForIndex(index) {
    if (index < 0 || index >= this.text.length) return null;

    let low = 0;
    let high = this.lineStartIndices.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.lineStartIndices[mid] > index) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    const line = low - 1;
    const column = index - this.lineStartIndices[line];
    return { line, column };
  }

  indexForLocation({ line, column }) {
    if (line < 0 || line >= this.lineStartIndices.length) return null;

    const lineStartIndex = this.lineStartIndices[line];
    const index = lineStartIndex + column;

    if (index >= this.text.length || (line + 1 < this.lineStartIndices.length && index >= this.lineStartIndices[line + 1])) {
      return null;
    }

    return index;
  }
}

export { LinesAndColumns };
