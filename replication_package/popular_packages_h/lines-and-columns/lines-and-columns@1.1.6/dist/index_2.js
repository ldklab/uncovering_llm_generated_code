"use strict";

class LinesAndColumns {
    constructor(string) {
        this.string = string;
        this.offsets = this.calculateOffsets(string);
    }

    calculateOffsets(string) {
        const offsets = [0];
        for (let offset = 0; offset < string.length;) {
            if (string[offset] === '\n') {
                offset += 1;
                offsets.push(offset);
            } else if (string[offset] === '\r') {
                offset += 1;
                if (string[offset] === '\n') offset += 1;
                offsets.push(offset);
            } else {
                offset += 1;
            }
        }
        return offsets;
    }

    locationForIndex(index) {
        if (index < 0 || index > this.string.length) return null;

        let line = 0;
        while (this.offsets[line + 1] <= index) {
            line++;
        }
        
        const column = index - this.offsets[line];
        return { line, column };
    }

    indexForLocation(location) {
        const { line, column } = location;
        if (line < 0 || line >= this.offsets.length) return null;
        if (column < 0 || column > this.lengthOfLine(line)) return null;
        
        return this.offsets[line] + column;
    }

    lengthOfLine(line) {
        const offset = this.offsets[line];
        const nextOffset = line === this.offsets.length - 1 ? this.string.length : this.offsets[line + 1];
        return nextOffset - offset;
    }
}

exports.__esModule = true;
exports["default"] = LinesAndColumns;
