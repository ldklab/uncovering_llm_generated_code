// lines-and-columns/index.js

class LinesAndColumns {
  constructor(text) {
    this.text = text;
    this.lineStartIndices = this.computeLineStartIndices();
  }

  computeLineStartIndices() {
    let indices = [0];
    this.text.split('').forEach((char, idx) => {
      if (char === '\n') indices.push(idx + 1);
    });
    return indices;
  }

  locationForIndex(index) {
    if (index < 0 || index >= this.text.length) return null;
    
    let line = 0;
    while (line < this.lineStartIndices.length - 1 && index >= this.lineStartIndices[line + 1]) {
      line++;
    }
    let column = index - this.lineStartIndices[line];
    return { line, column };
  }

  indexForLocation({ line, column }) {
    if (line < 0 || line >= this.lineStartIndices.length) return null;
    
    let index = this.lineStartIndices[line] + column;
    if (index >= this.text.length || (line < this.lineStartIndices.length - 1 && index >= this.lineStartIndices[line + 1])) {
      return null;
    }
    
    return index;
  }
}

export { LinesAndColumns };
