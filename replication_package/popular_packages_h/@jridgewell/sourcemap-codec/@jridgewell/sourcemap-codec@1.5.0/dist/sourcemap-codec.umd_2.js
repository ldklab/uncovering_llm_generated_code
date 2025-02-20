(function(root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        // CommonJS for Node.js
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['exports'], factory);
    } else {
        // Browser globals
        root = typeof globalThis !== 'undefined' ? globalThis : root || self;
        factory(root.sourcemapCodec = {});
    }
}(this, function(exports) {
    'use strict';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const intToChar = new Uint8Array(64);
    const charToInt = new Uint8Array(128);
    
    for (let i = 0; i < chars.length; i++) {
        let charCode = chars.charCodeAt(i);
        intToChar[i] = charCode;
        charToInt[charCode] = i;
    }

    function decodeInteger(reader, relative) {
        let value = 0, shift = 0, integer;

        do {
            let code = reader.next();
            integer = charToInt[code];
            value |= (integer & 31) << shift;
            shift += 5;
        } while (integer & 32);

        return relative + ((value & 1) ? -(value >>> 1) : (value >>> 1));
    }

    function encodeInteger(writer, number, relative) {
        let delta = number - relative;
        delta = delta < 0 ? (-delta << 1) | 1 : delta << 1;

        do {
            let clamped = delta & 31;
            delta >>>= 5;
            if (delta > 0) clamped |= 32;
            writer.write(intToChar[clamped]);
        } while (delta > 0);

        return number;
    }

    function hasMoreVlq(reader, max) {
        return reader.pos < max && reader.peek() !== ','.charCodeAt(0);
    }

    const TextDecodeBufferLength = 1024 * 16;
    const textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : require('buffer').Buffer.from;

    class StringWriter {
        constructor() {
            this.pos = 0;
            this.out = '';
            this.buffer = new Uint8Array(TextDecodeBufferLength);
        }
        write(value) {
            this.buffer[this.pos++] = value;
            if (this.pos === TextDecodeBufferLength) {
                this.out += textDecoder.decode(this.buffer);
                this.pos = 0;
            }
        }
        flush() {
            return this.out + (this.pos > 0 ? textDecoder.decode(this.buffer.subarray(0, this.pos)) : '');
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
        indexOf(char) {
            const idx = this.buffer.indexOf(char, this.pos);
            return idx === -1 ? this.buffer.length : idx;
        }
    }

    const EMPTY = [];

    function decodeOriginalScopes(input) {
        const reader = new StringReader(input);
        const scopes = [];
        let line = 0;

        while (reader.pos < input.length) {
            line = decodeInteger(reader, line);
            const column = decodeInteger(reader, 0);
            
            if (!hasMoreVlq(reader, input.length)) {
                const last = stack.pop();
                last[2] = line;
                last[3] = column;
                continue;
            }

            const stack = [];
            const kind = decodeInteger(reader, 0);
            const fields = decodeInteger(reader, 0);
            const hasName = fields & 1;
            const scope = hasName ?
                [line, column, 0, 0, kind, decodeInteger(reader, 0)] :
                [line, column, 0, 0, kind];
            
            let vars = EMPTY;
            if (hasMoreVlq(reader, input.length)) {
                vars = [];
                do {
                    vars.push(decodeInteger(reader, 0));
                } while (hasMoreVlq(reader, input.length));
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
        const { 0: startLine, 1: startColumn, 2: endLine, 3: endColumn, 4: kind, vars } = scope;
        if (index > 0) writer.write(','.charCodeAt(0));

        state[0] = encodeInteger(writer, startLine, state[0]);
        encodeInteger(writer, startColumn, 0);
        encodeInteger(writer, kind, 0);
        const hasName = scope.length === 6;
        encodeInteger(writer, hasName ? 1 : 0, 0);

        if (hasName) {
            encodeInteger(writer, scope[5], 0);
        }

        for (const v of vars) {
            encodeInteger(writer, v, 0);
        }

        for (index++; index < scopes.length;) {
            const next = scopes[index];
            if (next[0] > endLine || (next[0] === endLine && next[1] >= endColumn)) {
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
        let genLine = 0, definitionSourcesIndex = 0, definitionScopeIndex = 0;
        let callsiteSourcesIndex = 0, callsiteLine = 0, callsiteColumn = 0;

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

                const stack = [];
                const fields = decodeInteger(reader, 0);
                const hasDefinition = fields & 1;
                const hasCallsite = fields & 2;
                const hasScope = fields & 4;

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

                let callsite = null;
                if (hasCallsite) {
                    const prevCsi = callsiteSourcesIndex;
                    const prevLine = callsiteLine;
                    callsiteSourcesIndex = decodeInteger(reader, callsiteSourcesIndex);
                    const sameSource = prevCsi === callsiteSourcesIndex;
                    callsiteLine = decodeInteger(reader, sameSource ? callsiteLine : 0);
                    callsiteColumn = decodeInteger(reader, sameSource && prevLine === callsiteLine ? callsiteColumn : 0);
                    callsite = [callsiteSourcesIndex, callsiteLine, callsiteColumn];
                }
                range.callsite = callsite;

                let bindings = EMPTY;
                if (hasMoreVlq(reader, semi)) {
                    bindings = [];
                    do {
                        let bindingLine = genLine;
                        let bindingColumn = genColumn;
                        const expressionsCount = decodeInteger(reader, 0);
                        let expressionRanges;
                        if (expressionsCount < -1) {
                            expressionRanges = [[decodeInteger(reader, 0)]];
                            for (let i = -1; i > expressionsCount; i--) {
                                const prevBl = bindingLine;
                                bindingLine = decodeInteger(reader, bindingLine);
                                bindingColumn = decodeInteger(reader, bindingLine === prevBl ? bindingColumn : 0);
                                const expr = decodeInteger(reader, 0);
                                expressionRanges.push([expr, bindingLine, bindingColumn]);
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
        const { 0: startLine, 1: startColumn, 2: endLine, 3: endColumn, isScope, callsite, bindings } = range;

        if (state[0] < startLine) {
            catchupLine(writer, state[0], startLine);
            state[0] = startLine;
            state[1] = 0;
        } else if (index > 0) {
            writer.write(','.charCodeAt(0));
        }

        state[1] = encodeInteger(writer, startColumn, state[1]);
        const fields = (range.length === 6 ? 1 : 0) | (callsite ? 2 : 0) | (isScope ? 4 : 0);
        encodeInteger(writer, fields, 0);

        if (range.length === 6) {
            const { 4: sourcesIndex, 5: scopesIndex } = range;
            if (sourcesIndex !== state[2]) state[3] = 0;

            state[2] = encodeInteger(writer, sourcesIndex, state[2]);
            state[3] = encodeInteger(writer, scopesIndex, state[3]);
        }

        if (callsite) {
            const { 0: sourcesIndex, 1: callLine, 2: callColumn } = callsite;
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
                if (binding.length > 1) encodeInteger(writer, -binding.length, 0);

                encodeInteger(writer, binding[0][0], 0);
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
        while (++lastLine < line) {
            writer.write(';'.charCodeAt(0));
        }
    }

    function decode(mappings) {
        const reader = new StringReader(mappings);
        const result = [];
        let genColumn = 0, sourcesIndex = 0, sourceLine = 0, sourceColumn = 0, namesIndex = 0;

        do {
            const semi = reader.indexOf(';');
            const line = [];
            let sorted = true, lastCol = 0;

            genColumn = 0;
            while (reader.pos < semi) {
                let segment;

                genColumn = decodeInteger(reader, genColumn);
                if (genColumn < lastCol) sorted = false;
                lastCol = genColumn;
                
                if (hasMoreVlq(reader, semi)) {
                    sourcesIndex = decodeInteger(reader, sourcesIndex);
                    sourceLine = decodeInteger(reader, sourceLine);
                    sourceColumn = decodeInteger(reader, sourceColumn);

                    if (hasMoreVlq(reader, semi)) {
                        namesIndex = decodeInteger(reader, namesIndex);
                        segment = [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex];
                    } else {
                        segment = [genColumn, sourcesIndex, sourceLine, sourceColumn];
                    }
                } else {
                    segment = [genColumn];
                }
                line.push(segment);
                reader.pos++;
            }

            if (!sorted) line.sort((a, b) => a[0] - b[0]);
            result.push(line);
            reader.pos = semi + 1;
        } while (reader.pos <= mappings.length);

        return result;
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
                const segment = line[j];
                if (j > 0) writer.write(','.charCodeAt(0));

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

    Object.defineProperty(exports, '__esModule', { value: true });

    exports.decode = decode;
    exports.decodeGeneratedRanges = decodeGeneratedRanges;
    exports.decodeOriginalScopes = decodeOriginalScopes;
    exports.encode = encode;
    exports.encodeGeneratedRanges = encodeGeneratedRanges;
    exports.encodeOriginalScopes = encodeOriginalScopes;
}));
