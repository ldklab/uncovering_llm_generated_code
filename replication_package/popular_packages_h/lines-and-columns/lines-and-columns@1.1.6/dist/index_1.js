"use strict";

class LinesAndColumns {
  constructor(string) {
    this.string = string;
    this.offsets = this.calculateOffsets();
  }

  calculateOffsets() {
    const offsets = [0];
    const { string } = this;
    for (let offset = 0; offset < string.length; ) {
      if (string[offset] === '\n') {
        offset++;
        offsets.push(offset);
      } else if (string[offset] === '\r') {
        offset++;
        if (string[offset] === '\n') offset++;
        offsets.push(offset);
      } else {
        offset++;
      }
    }
    return offsets;
  }

  locationForIndex(index) {
    if (index < 0 || index > this.string.length) return null;
    let line = 0;
    while (line + 1 < this.offsets.length && this.offsets[line + 1] <= index) {
      line++;
    }
    const column = index - this.offsets[line];
    return { line, column };
  }

  indexForLocation({ line, column }) {
    if (line < 0 || line >= this.offsets.length) return null;
    if (column < 0 || column >= this.lengthOfLine(line)) return null;
    return this.offsets[line] + column;
  }

  lengthOfLine(line) {
    const offset = this.offsets[line];
    const nextOffset = line + 1 < this.offsets.length ? this.offsets[line + 1] : this.string.length;
    return nextOffset - offset;
  }
}

exports.__esModule = true;
exports["default"] = LinesAndColumns;
