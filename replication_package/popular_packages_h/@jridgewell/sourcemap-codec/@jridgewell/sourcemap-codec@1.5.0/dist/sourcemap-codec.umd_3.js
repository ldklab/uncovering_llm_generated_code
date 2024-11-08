(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        root = typeof globalThis !== 'undefined' ? globalThis : root || self;
        factory(root.sourcemapCodec = {});
    }
}(this, (function (exports) {
    'use strict';

    const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const BASE64_INT_SIZE = 64;

    const commaCode = ','.charCodeAt(0);
    const semicolonCode = ';'.charCodeAt(0);
    const intToBase64Char = new Uint8Array(BASE64_INT_SIZE);
    const base64CharToInt = new Uint8Array(128);

    for (let i = 0; i < BASE64_CHARS.length; i++) {
        const charCode = BASE64_CHARS.charCodeAt(i);
        intToBase64Char[i] = charCode;
        base64CharToInt[charCode] = i;
    }

    function decodeVLQNumber(reader, relative) {
        let value = 0, shift = 0, integer = 0;
        do {
            const charCode = reader.next();
            integer = base64CharToInt[charCode];
            value |= (integer & 31) << shift;
            shift += 5;
        } while (integer & 32);
        const isNegative = value & 1;
        value >>>= 1;
        return relative + (isNegative ? -value : value);
    }

    function encodeVLQNumber(builder, value, relative) {
        let delta = value - relative;
        delta = delta < 0 ? (-delta << 1) | 1 : delta << 1;
        do {
            let clamped = delta & 0b011111;
            delta >>>= 5;
            if (delta > 0) clamped |= 0b100000;
            builder.write(intToBase64Char[clamped]);
        } while (delta > 0);
        return value;
    }

    class StringWriter {
        constructor() {
            const bufferLength = 1024 * 16;
            this.pos = 0;
            this.out = '';
            this.buffer = new Uint8Array(bufferLength);
        }
        write(value) {
            this.buffer[this.pos++] = value;
            if (this.pos === this.buffer.length) {
                this.flushBuffer();
            }
        }
        flushBuffer() {
            const decoder = new TextDecoder();
            this.out += decoder.decode(this.buffer.subarray(0, this.pos));
            this.pos = 0;
        }
        flush() {
            const extra = this.pos > 0 ? new TextDecoder().decode(this.buffer.subarray(0, this.pos)) : '';
            return this.out + extra;
        }
    }

    class StringReader {
        constructor(string) {
            this.pos = 0;
            this.string = string;
        }
        next() {
            return this.string.charCodeAt(this.pos++);
        }
        peek() {
            return this.string.charCodeAt(this.pos);
        }
        indexOf(character) {
            return this.string.indexOf(character, this.pos);
        }
    }

    function decodeOriginalScopes(input) {
        const reader = new StringReader(input);
        const length = input.length;
        const scopes = [];
        const stack = [];
        let line = 0;
        while (reader.pos < length) {
            line = decodeVLQNumber(reader, line);
            const column = decodeVLQNumber(reader, 0);
            if (!hasMoreVLQ(reader, length)) {
                const scope = stack.pop();
                scope[2] = line;
                scope[3] = column;
                continue;
            }
            const kind = decodeVLQNumber(reader, 0);
            const fields = decodeVLQNumber(reader, 0);
            const hasName = fields & 0b0001;
            const scopeData = (hasName ? [line, column, 0, 0, kind, decodeVLQNumber(reader, 0)] : [line, column, 0, 0, kind]);
            scopeData.vars = decodeScopeVariables(reader, length);
            scopes.push(scopeData);
            stack.push(scopeData);
        }
        return scopes;
    }

    function decodeScopeVariables(reader, max) {
        const variables = [];
        while (hasMoreVLQ(reader, max)) {
            const varIndex = decodeVLQNumber(reader, 0);
            variables.push(varIndex);
        }
        return variables;
    }

    function encodeOriginalScopes(scopes) {
        const writer = new StringWriter();
        let state = [0];
        scopes.forEach((_, index) => {
            index = encodeScope(scopes, index, writer, state);
        });
        return writer.flush();
    }

    function encodeScope(scopes, index, writer, state) {
        const scope = scopes[index];
        const [startLine, startCol, endLine, endCol, kind, vars] = scope;
        if (index > 0) writer.write(commaCode);
        state[0] = encodeVLQNumber(writer, startLine, state[0]);
        encodeVLQNumber(writer, startCol, 0);
        encodeVLQNumber(writer, kind, 0);

        const fields = scope.length === 6 ? 0b0001 : 0;
        encodeVLQNumber(writer, fields, 0);
        if (scope.length === 6) encodeVLQNumber(writer, scope[5], 0);
        
        vars.forEach(varIndex => encodeVLQNumber(writer, varIndex, 0));

        for (let i = index + 1; i < scopes.length; i++) {
            const next = scopes[i];
            if (next[0] > endLine || (next[0] === endLine && next[1] >= endCol)) {
                break;
            }
            i = encodeScope(scopes, i, writer, state);
        }
        writer.write(commaCode);
        state[0] = encodeVLQNumber(writer, endLine, state[0]);
        encodeVLQNumber(writer, endCol, 0);
        return index;
    }

    function decodeGeneratedRanges(input) {
        const reader = new StringReader(input);
        const length = input.length;
        const ranges = [];
        const stack = [];
        let genLine = 0;

        do {
            const semi = reader.indexOf(';');
            let genCol = 0;

            while (reader.pos < semi) {
                genCol = decodeVLQNumber(reader, genCol);
                if (!hasMoreVLQ(reader, semi)) {
                    const range = stack.pop();
                    range[2] = genLine;
                    range[3] = genCol;
                    continue;
                }
                const fields = decodeVLQNumber(reader, 0);
                const hasDef = fields & 0b0001;
                const range = [genLine, genCol, 0, 0];

                if (hasDef) {
                    const srcIndex = decodeVLQNumber(reader, 0);
                    const scopeIndex = decodeVLQNumber(reader, 0);
                    range.push(srcIndex, scopeIndex);
                }
                ranges.push(range);
                stack.push(range);
            }
            genLine++;
            reader.pos = semi + 1;
        } while (reader.pos < length);
        
        return ranges;
    }

    function encodeGeneratedRanges(ranges) {
        if (!ranges.length) return '';
        const writer = new StringWriter();
        let state = [0, 0, 0, 0, 0, 0, 0];

        ranges.forEach((_, index) => {
            index = encodeRange(ranges, index, writer, state);
        });

        return writer.flush();
    }

    function encodeRange(ranges, index, writer, state) {
        const range = ranges[index];
        const [startLine, startCol, endLine, endCol] = range;

        if (state[0] < startLine) {
            writeNewLine(writer, state[0], startLine);
            state[0] = startLine;
            state[1] = 0;
        } else if (index > 0) {
            writer.write(commaCode);
        }

        state[1] = encodeVLQNumber(writer, startCol, state[1]);
        state[0] = encodeSubRanges(ranges, index, writer, state, endLine, endCol);

        return index;
    }

    function encodeSubRanges(ranges, index, writer, state, endLine, endCol) {
        for (let i = index + 1; i < ranges.length; i++) {
            const next = ranges[i];
            if (next[0] > endLine || (next[0] === endLine && next[1] >= endCol)) {
                break;
            }
            i = encodeRange(ranges, i, writer, state);
        }
        writeEndLine(writer, state, endLine, endCol);
        return index;
    }

    function writeEndLine(writer, state, endLine, endCol) {
        if (state[0] < endLine) {
            writeNewLine(writer, state[0], endLine);
            state[0] = endLine;
            state[1] = 0;
        } else {
            writer.write(commaCode);
        }
        state[1] = encodeVLQNumber(writer, endCol, state[1]);
    }

    function writeNewLine(writer, start, end) {
        while (++start < end) {
            writer.write(semicolonCode);
        }
    }

    function decode(input) {
        const reader = new StringReader(input);
        const length = input.length;
        const decoded = [];

        let genCol = 0, srcIndex = 0, srcLine = 0, srcCol = 0, nameIndex = 0;

        do {
            const semi = reader.indexOf(';');
            const line = [];
            let isSorted = true, lastCol = 0;
            genCol = 0;

            while (reader.pos < semi) {
                genCol = decodeVLQNumber(reader, genCol);

                if (genCol < lastCol) isSorted = false;
                lastCol = genCol;

                const seg = decodeSegment(reader, semi, genCol, srcIndex, srcLine, srcCol, nameIndex);
                srcIndex = seg[1];
                srcLine = seg[2];
                srcCol = seg[3];
                if (seg.length === 5) {
                    nameIndex = seg[4];
                }
                line.push(seg);
                reader.pos++;
            }

            if (!isSorted) line.sort((a, b) => a[0] - b[0]);
            decoded.push(line);
            reader.pos = semi + 1;

        } while (reader.pos < length);

        return decoded;
    }

    function decodeSegment(reader, semi, genCol, srcIndex, srcLine, srcCol, nameIndex) {
        const segment = [genCol];

        if (hasMoreVLQ(reader, semi)) {
            srcIndex = decodeVLQNumber(reader, srcIndex);
            srcLine = decodeVLQNumber(reader, srcLine);
            srcCol = decodeVLQNumber(reader, srcCol);

            segment.push(srcIndex, srcLine, srcCol);

            if (hasMoreVLQ(reader, semi)) {
                nameIndex = decodeVLQNumber(reader, nameIndex);
                segment.push(nameIndex);
            }
        }

        return segment;
    }

    function hasMoreVLQ(reader, max) {
        return reader.pos < max && reader.peek() !== commaCode;
    }

    function encode(decoded) {
        const writer = new StringWriter();
        let state = [0, 0, 0, 0, 0];

        decoded.forEach(line => {
            if (state[0] > 0) writer.write(semicolonCode);
            const genCol = encodeLine(writer, line, state);
            state[1] = genCol;
        });

        return writer.flush();
    }

    function encodeLine(writer, line, state) {
        if (!line.length) return state[1];
        let genCol = 0;
        line.forEach(segment => {
            if (genCol > 0) writer.write(commaCode);
            genCol = encodeSegment(writer, segment, genCol, state);
        });
        state[0]++;
        return genCol;
    }

    function encodeSegment(writer, segment, genCol, state) {
        genCol = encodeVLQNumber(writer, segment[0], genCol);
        if (segment.length > 1) {
            state[0] = encodeVLQNumber(writer, segment[1], state[0]);
            state[1] = encodeVLQNumber(writer, segment[2], state[1]);
            state[2] = encodeVLQNumber(writer, segment[3], state[2]);
            if (segment.length === 5) {
                state[3] = encodeVLQNumber(writer, segment[4], state[3]);
            }
        }
        return genCol;
    }

    exports.decode = decode;
    exports.decodeGeneratedRanges = decodeGeneratedRanges;
    exports.decodeOriginalScopes = decodeOriginalScopes;
    exports.encode = encode;
    exports.encodeGeneratedRanges = encodeGeneratedRanges;
    exports.encodeOriginalScopes = encodeOriginalScopes;
    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=sourcemap-codec.umd.js.map
