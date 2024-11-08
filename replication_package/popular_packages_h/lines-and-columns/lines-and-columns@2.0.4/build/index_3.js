"use strict";

class LinesAndColumns {
    constructor(string) {
        this.length = string.length;
        this.offsets = [];
        
        let offset = 0;
        for (let i = 0; i < string.length; i++) {
            if (string[i] === '\n' || (string[i] === '\r' && string[i + 1] !== '\n')) {
                this.offsets.push(offset);
            }
            if (string[i] === '\r' && string[i + 1] === '\n') {
                i++; // Skip the '\n' in '\r\n'
            }
            offset++;
        }
        this.offsets.push(offset); // Push the final offset
    }

    locationForIndex(index) {
        if (index < 0 || index > this.length) return null;

        let line = 0;
        while (this.offsets[line + 1] <= index) {
            line++;
        }
        
        let column = index - this.offsets[line];
        return { line, column };
    }

    indexForLocation({ line, column }) {
        if (line < 0 || line >= this.offsets.length) return null;
        if (column < 0 || column > this.lengthOfLine(line)) return null;

        return this.offsets[line] + column;
    }

    lengthOfLine(line) {
        const offset = this.offsets[line];
        const nextOffset = (line === this.offsets.length - 1)
            ? this.length
            : this.offsets[line + 1];
        return nextOffset - offset;
    }
}

module.exports = { LinesAndColumns };
