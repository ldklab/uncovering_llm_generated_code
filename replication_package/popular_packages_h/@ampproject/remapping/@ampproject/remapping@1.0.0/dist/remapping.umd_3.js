(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.remapping = factory());
}(this, (function () { 'use strict';

    // Helper function to map characters to Base64 integers
    function createCharToIntegerMap() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let map = {};
        for (let i = 0; i < chars.length; i++) {
            map[chars.charCodeAt(i)] = i;
        }
        return map;
    }
    
    const charToInteger = createCharToIntegerMap();

    // Helper function to decode VLQ encoded mappings
    function decode(mappings) {
        let decoded = [], line = [];
        let segment = [0, 0, 0, 0, 0];
        let j = 0, shift = 0, value = 0;

        // Processing mappings
        for (let i = 0; i < mappings.length; i++) {
            const charCode = mappings.charCodeAt(i);
            
            if (charCode === 44) { // ","
                segmentify(line, segment, j);
                j = 0;
            } else if (charCode === 59) { // ";"
                segmentify(line, segment, j);
                j = 0;
                decoded.push(line);
                line = [];
                segment[0] = 0;
            } else {
                const integer = charToInteger[charCode];
                
                if (integer === undefined) {
                    throw new Error(`Invalid character (${String.fromCharCode(charCode)})`);
                }
                
                const hasContinuationBit = integer & 32;
                value += (integer & 31) << shift;
                
                if (hasContinuationBit) {
                    shift += 5;
                } else {
                    const shouldNegate = value & 1;
                    value >>>= 1;
                    
                    if (shouldNegate) value = value === 0 ? -2147483648 : -value;
                    
                    segment[j] += value;
                    j++;
                    value = shift = 0;
                }
            }
        }
        
        segmentify(line, segment, j);
        decoded.push(line);

        return decoded;
    }

    // Encodes integer to VLQ
    function encodeInteger(num) {
        let result = '';
        num = num < 0 ? (-num << 1) | 1 : num << 1;
        
        do {
            let clamped = num & 31;
            num >>>= 5;
            if (num > 0) clamped |= 32;
            result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='[clamped];
        } while (num > 0);
        
        return result;
    }

    // Helper function to create segments from a line
    function segmentify(line, segment, j) {
        if (j === 4) line.push([segment[0], segment[1], segment[2], segment[3]]);
        else if (j === 5) line.push([segment[0], segment[1], segment[2], segment[3], segment[4]]);
        else if (j === 1) line.push([segment[0]]);
    }

    // Function for encoding the decoded mappings
    function encode(decoded) {
        let mappings = '';
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            if (i > 0) mappings += ';';
            if (line.length === 0) continue;
            
            let generatedCodeColumn = 0;
            const lineMappings = [];
            
            for (let segment of line) {
                let segmentMappings = encodeInteger(segment[0] - generatedCodeColumn);
                generatedCodeColumn = segment[0];
                
                if (segment.length > 1) {
                    segmentMappings += encodeInteger(segment[1] - 0) + encodeInteger(segment[2] - 0) + encodeInteger(segment[3] - 0);
                }
                if (segment.length === 5) {
                    segmentMappings += encodeInteger(segment[4] - 0);
                }
                lineMappings.push(segmentMappings);
            }
            mappings += lineMappings.join(',');
        }
        return mappings;
    }

    // Helper function to merge objects, returning a new prototype-less object
    function defaults(target, source) {
        return Object.assign(Object.create(null), source, target);
    }

    // Decode a given source map string or object
    function decodeSourceMap(map) {
        if (typeof map === 'string') map = JSON.parse(map);
        let { mappings } = map;
        return defaults({ mappings: typeof mappings === 'string' ? sortMappings(decode(mappings), true) : sortMappings(mappings, false) }, map);
    }

    // Helper class for handling source files
    class OriginalSource {
        constructor(filename, content) {
            this.filename = filename;
            this.content = content;
        }
        traceSegment(line, column, name) {
            return { column, line, name, source: this };
        }
    }

    // URL and path helper functions
    const Url = (typeof URL !== 'undefined' ? URL : require('url').URL);

    // Normalize and resolve paths and URLs
    function isAbsoluteUrl(url) {
        try { return !!new Url(url); } catch (e) { return false; }
    }
    function resolvePath(input, base) {
        if (!base) base = '';
        if (isAbsoluteUrl(input)) return new Url(input).href;
        if (base) {
            if (isAbsoluteUrl(base)) return new Url(input, base).href;
            if (base.startsWith('//')) return normalizeProtocolRelative(input, `https:${base}`);
        }
        if (input.startsWith('//')) return normalizeProtocolRelative(input, 'https://foo.com/');
        if (input.startsWith('/')) return '/' + normalizeSimplePath(input);

        const joined = stripPathFilename(base) + input;
        if (base.startsWith('/')) return '/' + normalizeSimplePath(joined);

        const relative = normalizePath(joined);
        if ((base || input).startsWith('.') && !relative.startsWith('.')) {
            return './' + relative;
        }
        return relative;
    }

    function normalizeProtocolRelative(input, absoluteBase) {
        const { href, protocol } = new Url(input, absoluteBase);
        return href.slice(protocol.length);
    }

    function normalizeSimplePath(input) {
        const { href } = new Url(input, 'https://foo.com/');
        return href.slice('https://foo.com/'.length);
    }

    function normalizePath(input) {
        const uniqDirectory = `z${uniqInStr(input)}/`;
        const search = new RegExp(`^(?:${uniqDirectory})*`);
        const relative = normalizeSimplePath(uniqDirectory.repeat(total) + input);

        return relative.replace(search, (all) => {
            const leftover = all.length / uniqDirectory.length;
            return '../'.repeat(total - leftover);
        });
    }

    // Main function to handle remapping of source maps
    function remapping(input, loader, options) {
        const opts = typeof options === 'object' ? options : { excludeContent: !!options, decodedMappings: false };
        const graph = buildSourceMapTree(input, loader);
        return new SourceMap(graph.traceMappings(), opts);
    }

    // Exporting the main function
    return remapping;

})));
