"use strict";

exports.__esModule = true;
exports.LinesAndColumns = void 0;

const LF = '\n';
const CR = '\r';

class LinesAndColumns {
    constructor(string) {
        this.length = string.length;
        this.offsets = this.calculateOffsets(string);
    }

    calculateOffsets(string) {
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
        return offsets;
    }

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
        return { line, column };
    }

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

    lengthOfLine(line) {
        const offset = this.offsets[line];
        const nextOffset = line === this.offsets.length - 1
            ? this.length
            : this.offsets[line + 1];
        return nextOffset - offset;
    }
}

exports.LinesAndColumns = LinesAndColumns;
