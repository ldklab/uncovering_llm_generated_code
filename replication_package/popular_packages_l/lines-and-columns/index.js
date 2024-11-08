// lines-and-columns/index.js

class LinesAndColumns {
  constructor(text) {
    this.text = text;
    this.lineStartIndices = this.computeLineStartIndices(text);
  }

  computeLineStartIndices(text) {
    const lineStartIndices = [0];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        lineStartIndices.push(i + 1);
      }
    }
    return lineStartIndices;
  }

  locationForIndex(index) {
    if (index < 0 || index >= this.text.length) {
      return null;
    }
    
    let line = 0;
    while (line < this.lineStartIndices.length - 1 &&
           index >= this.lineStartIndices[line + 1]) {
      line++;
    }

    const column = index - this.lineStartIndices[line];
    return { line, column };
  }

  indexForLocation({ line, column }) {
    if (line < 0 || line >= this.lineStartIndices.length) {
      return null;
    }

    const lineStartIndex = this.lineStartIndices[line];
    const index = lineStartIndex + column;

    if (index >= this.text.length || (line < this.lineStartIndices.length - 1 && index >= this.lineStartIndices[line + 1])) {
      return null;
    }

    return index;
  }
}

export { LinesAndColumns };
