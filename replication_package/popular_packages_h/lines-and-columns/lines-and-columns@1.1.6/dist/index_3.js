"use strict";

const LF = '\n';
const CR = '\r';

class LinesAndColumns {
    constructor(string) {
        this.string = string;
        this.offsets = [0];
        
        for (let offset = 0; offset < string.length;) {
            const char = string[offset];
            
            if (char === LF) {
                offset += LF.length;
                this.offsets.push(offset);
            } else if (char === CR) {
                offset += CR.length;
                if (string[offset] === LF) offset += LF.length;
                this.offsets.push(offset);
            } else {
                offset++;
            }
        }
    }

    locationForIndex(index) {
        if (index < 0 || index > this.string.length) return null;

        let line = 0;
        while (this.offsets[line + 1] <= index) line++;
        
        const column = index - this.offsets[line];
        return { line, column };
    }

    indexForLocation(location) {
        const { line, column } = location;
        if (line < 0 || line >= this.offsets.length || column < 0 || column > this.lengthOfLine(line)) {
            return null;
        }

        return this.offsets[line] + column;
    }

    lengthOfLine(line) {
        const offset = this.offsets[line];
        const nextOffset = line === this.offsets.length - 1 ? this.string.length : this.offsets[line + 1];
        return nextOffset - offset;
    }
}

export default LinesAndColumns;
