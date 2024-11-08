"use strict";

const LF = '\n';
const CR = '\r';

class LinesAndColumns {
    constructor(string) {
        // Store the length of the string
        this.length = string.length;
        // Initialize an array to store the offsets of each line
        const offsets = [0];
        for (let offset = 0; offset < string.length;) {
            switch (string[offset]) {
                case LF:
                    offset += LF.length;
                    offsets.push(offset);
                    break;
                case CR:
                    offset += CR.length;
                    if (string[offset] === LF) {
                        offset += LF.length;
                    }
                    offsets.push(offset);
                    break;
                default:
                    offset++;
                    break;
            }
        }
        this.offsets = offsets;
    }

    // Finds the line and column position for a given string index
    locationForIndex(index) {
        if (index < 0 || index > this.length) {
            return null;
        }
        let line = 0;
        const offsets = this.offsets;
        while (offsets[line + 1] <= index) {
            line++;
        }
        const column = index - offsets[line];
        return { line: line, column: column };
    }

    // Finds the string index for a given line and column position
    indexForLocation(location) {
        const { line, column } = location;
        if (line < 0 || line >= this.offsets.length) {
            return null;
        }
        if (column < 0 || column > this.lengthOfLine(line)) {
            return null;
        }
        return this.offsets[line] + column;
    }

    // Calculates the length of a given line
    lengthOfLine(line) {
        const offset = this.offsets[line];
        const nextOffset = line === this.offsets.length - 1
            ? this.length
            : this.offsets[line + 1];
        return nextOffset - offset;
    }
}

// Export the class
module.exports = { LinesAndColumns };
