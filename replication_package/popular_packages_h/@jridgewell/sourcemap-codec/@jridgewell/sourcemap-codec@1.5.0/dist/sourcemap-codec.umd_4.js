(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        root = typeof globalThis !== 'undefined' ? globalThis : root || self;
        factory(root.sourcemapCodec = {});
    }
})(this, function (exports) {
    'use strict';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const intToChar = new Uint8Array(64);
    const charToInt = new Uint8Array(128);

    for (let i = 0; i < chars.length; i++) {
        const charCode = chars.charCodeAt(i);
        intToChar[i] = charCode;
        charToInt[charCode] = i;
    }

    function decodeInteger(reader, relative) {
        let value = 0, shift = 0, integer;
        do {
            const c = reader.next();
            integer = charToInt[c];
            value |= (integer & 31) << shift;
            shift += 5;
        } while (integer & 32);
        const shouldNegate = value & 1;
        value >>>= 1;
        return shouldNegate ? relative + -0x80000000 | -value : relative + value;
    }

    function encodeInteger(builder, num, relative) {
        let delta = num - relative;
        delta = delta < 0 ? (-delta << 1) | 1 : delta << 1;
        do {
            let clamped = delta & 0b011111;
            delta >>>= 5;
            if (delta > 0) clamped |= 0b100000;
            builder.write(intToChar[clamped]);
        } while (delta > 0);
        return num;
    }

    function hasMoreVlq(reader, max) {
        return reader.pos < max && reader.peek() !== ','.charCodeAt(0);
    }

    const bufLength = 1024 * 16;
    const td = typeof TextDecoder !== 'undefined' 
        ? new TextDecoder() 
        : typeof Buffer !== 'undefined'
            ? { decode: buf => Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength).toString() }
            : { decode: buf => String.fromCharCode.apply(0, buf) };

    class StringWriter {
        constructor() {
            this.pos = 0;
            this.out = '';
            this.buffer = new Uint8Array(bufLength);
        }

        write(value) {
            this.buffer[this.pos++] = value;
            if (this.pos === bufLength) {
                this.out += td.decode(this.buffer);
                this.pos = 0;
            }
        }

        flush() {
            return this.pos > 0 ? this.out + td.decode(this.buffer.subarray(0, this.pos)) : this.out;
        }
    }

    class StringReader {
        constructor(buffer) {
            this.pos = 0;
            this.buffer = buffer;
        }

        next() {
            return this.buffer.charCodeAt(this.pos++);
        }

        peek() {
            return this.buffer.charCodeAt(this.pos);
        }
    }

    const EMPTY = [];

    function decodeOriginalScopes(input) {
        const reader = new StringReader(input);
        const scopes = [];
        const stack = [];
        let line = 0;

        for (let length = input.length; reader.pos < length; reader.pos++) {
            line = decodeInteger(reader, line);
            const column = decodeInteger(reader, 0);

            if (!hasMoreVlq(reader, length)) {
                const last = stack.pop();
                last[2] = line;
                last[3] = column;
                continue;
            }

            const kind = decodeInteger(reader, 0);
            const fields = decodeInteger(reader, 0);
            const hasName = fields & 0b0001;
            const scope = hasName 
                ? [line, column, 0, 0, kind, decodeInteger(reader, 0)] 
                : [line, column, 0, 0, kind];
            let vars = EMPTY;

            if (hasMoreVlq(reader, length)) {
                vars = [];
                do {
                    vars.push(decodeInteger(reader, 0));
                } while (hasMoreVlq(reader, length));
            }

            scope.vars = vars;
            scopes.push(scope);
            stack.push(scope);
        }

        return scopes;
    }

    function encodeOriginalScopes(scopes) {
        const writer = new StringWriter();
        for (let i = 0; i < scopes.length;) {
            i = _encodeOriginalScopes(scopes, i, writer, [0]);
        }
        return writer.flush();
    }

    function _encodeOriginalScopes(scopes, index, writer, state) {
        const scope = scopes[index];
        const [startLine, startColumn, endLine, endColumn, kind, vars] = scope;
        
        if (index > 0) writer.write(','.charCodeAt(0));
        
        state[0] = encodeInteger(writer, startLine, state[0]);
        encodeInteger(writer, startColumn, 0);
        encodeInteger(writer, kind, 0);

        const fields = scope.length === 6 ? 0b0001 : 0;
        encodeInteger(writer, fields, 0);
        
        if (scope.length === 6) {
            encodeInteger(writer, scope[5], 0);
        }

        for (const v of vars) {
            encodeInteger(writer, v, 0);
        }

        for (index++; index < scopes.length;) {
            const next = scopes[index];
            const [l, c] = next;
            if (l > endLine || (l === endLine && c >= endColumn)) {
                break;
            }
            index = _encodeOriginalScopes(scopes, index, writer, state);
        }
        
        writer.write(','.charCodeAt(0));
        state[0] = encodeInteger(writer, endLine, state[0]);
        encodeInteger(writer, endColumn, 0);

        return index;
    }

    function decodeGeneratedRanges(input) {
        const reader = new StringReader(input);
        const ranges = [];
        const stack = [];
        let genLine = 0;
        let definitionSourcesIndex = 0, definitionScopeIndex = 0;
        let callsiteSourcesIndex = 0, callsiteLine = 0, callsiteColumn = 0;
        let bindingLine = 0, bindingColumn = 0;

        do {
            const semi = reader.indexOf(';');
            let genColumn = 0;

            for (; reader.pos < semi; reader.pos++) {
                genColumn = decodeInteger(reader, genColumn);

                if (!hasMoreVlq(reader, semi)) {
                    const last = stack.pop();
                    last[2] = genLine;
                    last[3] = genColumn;
                    continue;
                }

                const fields = decodeInteger(reader, 0);
                const hasDefinition = fields & 0b0001;
                const hasCallsite = fields & 0b0010;
                const hasScope = fields & 0b0100;

                let callsite = null;
                let bindings = EMPTY;
                let range;

                if (hasDefinition) {
                    const defSourcesIndex = decodeInteger(reader, definitionSourcesIndex);
                    definitionScopeIndex = decodeInteger(reader, definitionSourcesIndex === defSourcesIndex ? definitionScopeIndex : 0);
                    definitionSourcesIndex = defSourcesIndex;
                    range = [genLine, genColumn, 0, 0, defSourcesIndex, definitionScopeIndex];
                } else {
                    range = [genLine, genColumn, 0, 0];
                }

                range.isScope = !!hasScope;

                if (hasCallsite) {
                    const prevCsi = callsiteSourcesIndex;
                    callsiteSourcesIndex = decodeInteger(reader, callsiteSourcesIndex);
                    const sameSource = prevCsi === callsiteSourcesIndex;
                    callsiteLine = decodeInteger(reader, sameSource ? callsiteLine : 0);
                    callsiteColumn = decodeInteger(reader, sameSource && callsiteLine === callsiteLine ? callsiteColumn : 0);
                    callsite = [callsiteSourcesIndex, callsiteLine, callsiteColumn];
                }

                range.callsite = callsite;

                if (hasMoreVlq(reader, semi)) {
                    bindings = [];
                    do {
                        bindingLine = genLine;
                        bindingColumn = genColumn;
                        const expressionsCount = decodeInteger(reader, 0);
                        let expressionRanges;
                        if (expressionsCount < -1) {
                            expressionRanges = [[decodeInteger(reader, 0)]];
                            for (let i = -1; i > expressionsCount; i--) {
                                const prevBl = bindingLine;
                                bindingLine = decodeInteger(reader, bindingLine);
                                bindingColumn = decodeInteger(reader, bindingLine === prevBl ? bindingColumn : 0);
                                const expression = decodeInteger(reader, 0);
                                expressionRanges.push([expression, bindingLine, bindingColumn]);
                            }
                        } else {
                            expressionRanges = [[expressionsCount]];
                        }
                        bindings.push(expressionRanges);
                    } while (hasMoreVlq(reader, semi));
                }

                range.bindings = bindings;
                ranges.push(range);
                stack.push(range);
            }

            genLine++;
            reader.pos = semi + 1;
        } while (reader.pos < input.length);

        return ranges;
    }

    function encodeGeneratedRanges(ranges) {
        if (ranges.length === 0) return '';

        const writer = new StringWriter();
        for (let i = 0; i < ranges.length;) {
            i = _encodeGeneratedRanges(ranges, i, writer, [0, 0, 0, 0, 0, 0, 0]);
        }
        return writer.flush();
    }

    function _encodeGeneratedRanges(ranges, index, writer, state) {
        const range = ranges[index];
        const [startLine, startColumn, endLine, endColumn, isScope, callsite, bindings] = range;

        if (state[0] < startLine) {
            catchupLine(writer, state[0], startLine);
            state[0] = startLine;
            state[1] = 0;
        } else if (index > 0) {
            writer.write(','.charCodeAt(0));
        }

        state[1] = encodeInteger(writer, range[1], state[1]);

        const fields = (range.length === 6 ? 0b0001 : 0) | (callsite ? 0b0010 : 0) | (isScope ? 0b0100 : 0);
        encodeInteger(writer, fields, 0);

        if (range.length === 6) {
            if (range[4] !== state[2]) {
                state[3] = 0;
            }
            state[2] = encodeInteger(writer, range[4], state[2]);
            state[3] = encodeInteger(writer, range[5], state[3]);
        }

        if (callsite) {
            const [sourcesIndex, callLine, callColumn] = callsite;
            if (sourcesIndex !== state[4]) {
                state[5] = 0;
                state[6] = 0;
            } else if (callLine !== state[5]) {
                state[6] = 0;
            }
            state[4] = encodeInteger(writer, sourcesIndex, state[4]);
            state[5] = encodeInteger(writer, callLine, state[5]);
            state[6] = encodeInteger(writer, callColumn, state[6]);
        }

        if (bindings) {
            for (const binding of bindings) {
                if (binding.length > 1)
                    encodeInteger(writer, -binding.length, 0);
                const expression = binding[0][0];
                encodeInteger(writer, expression, 0);
                let bindingStartLine = startLine;
                let bindingStartColumn = startColumn;
                for (let i = 1; i < binding.length; i++) {
                    const expRange = binding[i];
                    bindingStartLine = encodeInteger(writer, expRange[1], bindingStartLine);
                    bindingStartColumn = encodeInteger(writer, expRange[2], bindingStartColumn);
                    encodeInteger(writer, expRange[0], 0);
                }
            }
        }

        for (index++; index < ranges.length;) {
            const next = ranges[index];
            if (next[0] > endLine || (next[0] === endLine && next[1] >= endColumn)) {
                break;
            }
            index = _encodeGeneratedRanges(ranges, index, writer, state);
        }

        if (state[0] < endLine) {
            catchupLine(writer, state[0], endLine);
            state[0] = endLine;
            state[1] = 0;
        } else {
            writer.write(','.charCodeAt(0));
        }

        state[1] = encodeInteger(writer, endColumn, state[1]);
        return index;
    }

    function catchupLine(writer, lastLine, line) {
        do {
            writer.write(';'.charCodeAt(0));
        } while (++lastLine < line);
    }

    function decode(mappings) {
        const reader = new StringReader(mappings);
        const decoded = [];
        let genColumn = 0, sourcesIndex = 0, sourceLine = 0, sourceColumn = 0, namesIndex = 0;

        do {
            const semi = reader.indexOf(';');
            const line = [];
            let sorted = true, lastCol = 0;
            genColumn = 0;

            while (reader.pos < semi) {
                genColumn = decodeInteger(reader, genColumn);
                if (genColumn < lastCol) sorted = false;
                lastCol = genColumn;

                let seg;
                if (hasMoreVlq(reader, semi)) {
                    sourcesIndex = decodeInteger(reader, sourcesIndex);
                    sourceLine = decodeInteger(reader, sourceLine);
                    sourceColumn = decodeInteger(reader, sourceColumn);

                    if (hasMoreVlq(reader, semi)) {
                        namesIndex = decodeInteger(reader, namesIndex);
                        seg = [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex];
                    } else {
                        seg = [genColumn, sourcesIndex, sourceLine, sourceColumn];
                    }
                } else {
                    seg = [genColumn];
                }

                line.push(seg);
                reader.pos++;
            }

            if (!sorted)
                line.sort((a, b) => a[0] - b[0]);

            decoded.push(line);
            reader.pos = semi + 1;
        } while (reader.pos <= mappings.length);

        return decoded;
    }

    function encode(decoded) {
        const writer = new StringWriter();
        let sourcesIndex = 0, sourceLine = 0, sourceColumn = 0, namesIndex = 0;

        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            if (i > 0) writer.write(';'.charCodeAt(0));
            if (line.length === 0) continue;

            let genColumn = 0;
            for (let j = 0; j < line.length; j++) {
                if (j > 0) writer.write(','.charCodeAt(0));
                const segment = line[j];

                genColumn = encodeInteger(writer, segment[0], genColumn);
                if (segment.length === 1) continue;

                sourcesIndex = encodeInteger(writer, segment[1], sourcesIndex);
                sourceLine = encodeInteger(writer, segment[2], sourceLine);
                sourceColumn = encodeInteger(writer, segment[3], sourceColumn);
                if (segment.length === 5) {
                    namesIndex = encodeInteger(writer, segment[4], namesIndex);
                }
            }
        }

        return writer.flush();
    }

    exports.decode = decode;
    exports.decodeGeneratedRanges = decodeGeneratedRanges;
    exports.decodeOriginalScopes = decodeOriginalScopes;
    exports.encode = encode;
    exports.encodeGeneratedRanges = encodeGeneratedRanges;
    exports.encodeOriginalScopes = encodeOriginalScopes;

    Object.defineProperty(exports, '__esModule', { value: true });
});
