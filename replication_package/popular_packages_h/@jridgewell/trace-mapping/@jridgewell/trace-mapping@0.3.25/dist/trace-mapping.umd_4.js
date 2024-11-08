(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(exports, require('@jridgewell/sourcemap-codec'), require('@jridgewell/resolve-uri'));
    } else if (typeof define === 'function' && define.amd) {
        define(['exports', '@jridgewell/sourcemap-codec', '@jridgewell/resolve-uri'], factory);
    } else {
        factory(root.traceMapping = {}, root.sourcemapCodec, root.resolveURI);
    }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (exports, sourcemapCodec, resolveUri) {
    'use strict';

    function resolve(input, base) {
        if (base && !base.endsWith('/')) base += '/';
        return resolveUri(input, base);
    }

    function stripFilename(path) {
        return path ? path.slice(0, path.lastIndexOf('/') + 1) : '';
    }

    const COLUMN = 0, SOURCES_INDEX = 1, SOURCE_LINE = 2, SOURCE_COLUMN = 3, NAMES_INDEX = 4;
    const REV_GENERATED_LINE = 1, REV_GENERATED_COLUMN = 2;
    const LEAST_UPPER_BOUND = -1, GREATEST_LOWER_BOUND = 1;
    const LINE_GTR_ZERO = '`line` must be greater than 0 (lines start at line 1)';
    const COL_GTR_EQ_ZERO = '`column` must be greater than or equal to 0 (columns start at column 0)';
    
    function maybeSort(mappings, owned) {
        const unsortedIndex = nextUnsortedSegmentLine(mappings, 0);
        if (unsortedIndex === mappings.length) return mappings;
        if (!owned) mappings = mappings.slice();
        for (let i = unsortedIndex; i < mappings.length; i = nextUnsortedSegmentLine(mappings, i + 1)) {
            mappings[i] = sortSegments(mappings[i], owned);
        }
        return mappings;
    }

    function nextUnsortedSegmentLine(mappings, start) {
        for (let i = start; i < mappings.length; i++) {
            if (!isSorted(mappings[i])) return i;
        }
        return mappings.length;
    }

    function isSorted(line) {
        for (let j = 1; j < line.length; j++) {
            if (line[j][COLUMN] < line[j - 1][COLUMN]) return false;
        }
        return true;
    }

    function sortSegments(line, owned) {
        return owned ? line : line.slice().sort(sortComparator);
    }

    function sortComparator(a, b) {
        return a[COLUMN] - b[COLUMN];
    }

    function binarySearch(haystack, needle, low, high) {
        let found = false;
        while (low <= high) {
            const mid = low + ((high - low) >> 1);
            const cmp = haystack[mid][COLUMN] - needle;
            if (cmp === 0) {
                found = true;
                return mid;
            }
            if (cmp < 0) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return low - 1;
    }

    function memoizedState() {
        return { lastKey: -1, lastNeedle: -1, lastIndex: -1 };
    }

    function memoizedBinarySearch(haystack, needle, state, key) {
        const { lastKey, lastNeedle, lastIndex } = state;
        let low = 0, high = haystack.length - 1;
        if (key === lastKey && needle === lastNeedle) {
            state.lastIndex = (found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle) ? lastIndex : -1;
            return lastIndex;
        }
        if (key === lastKey) {
            if (needle >= lastNeedle) low = lastIndex === -1 ? 0 : lastIndex;
            else high = lastIndex;
        }
        state.lastKey = key;
        state.lastNeedle = needle;
        state.lastIndex = binarySearch(haystack, needle, low, high);
        return state.lastIndex;
    }

    function buildNullArray() {
        return { __proto__: null };
    }

    function buildBySources(decoded, memos) {
        const sources = memos.map(buildNullArray);
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            for (let j = 0; j < line.length; j++) {
                const seg = line[j];
                if (seg.length === 1) continue;
                const sourceIndex = seg[SOURCES_INDEX];
                const sourceLine = seg[SOURCE_LINE];
                const sourceColumn = seg[SOURCE_COLUMN];
                const originalSource = sources[sourceIndex];
                const originalLine = originalSource[sourceLine] || (originalSource[sourceLine] = []);
                const memo = memos[sourceIndex];
                let index = binarySearch(originalLine, sourceColumn, memo, sourceLine) + 1;
                memo.lastIndex = index;
                insert(originalLine, index, [sourceColumn, i, seg[COLUMN]]);
            }
        }
        return sources;
    }

    function insert(array, index, value) {
        for (let i = array.length; i > index; i--) {
            array[i] = array[i - 1];
        }
        array[index] = value;
    }

    class TraceMap {
        constructor(map, mapUrl) {
            const isString = typeof map === 'string';
            if (!isString && map._decodedMemo) return map;
            const parsed = isString ? JSON.parse(map) : map;
            const { version, file, names, sourceRoot, sources, sourcesContent } = parsed;
            this.version = version;
            this.file = file;
            this.names = names || [];
            this.sourceRoot = sourceRoot;
            this.sources = sources;
            this.sourcesContent = sourcesContent;
            this.ignoreList = parsed.ignoreList || parsed.x_google_ignoreList || undefined;
            const from = resolve(sourceRoot || '', stripFilename(mapUrl));
            this.resolvedSources = sources.map(s => resolve(s || '', from));
            const { mappings } = parsed;
            if (typeof mappings === 'string') {
                this._encoded = mappings;
                this._decoded = undefined;
            } else {
                this._encoded = undefined;
                this._decoded = maybeSort(mappings, isString);
            }
            this._decodedMemo = memoizedState();
            this._bySources = undefined;
            this._bySourceMemos = undefined;
        }
    }

    function encodedMappings(map) {
        return map._encoded ?? (map._encoded = sourcemapCodec.encode(map._decoded));
    }

    function decodedMappings(map) {
        return map._decoded ?? (map._decoded = sourcemapCodec.decode(map._encoded));
    }

    function originalPositionFor(map, needle) {
        let { line, column, bias } = needle;
        line--;
        if (line < 0) throw new Error(LINE_GTR_ZERO);
        if (column < 0) throw new Error(COL_GTR_EQ_ZERO);

        const decoded = decodedMappings(map);
        if (line >= decoded.length) return { source: null, line: null, column: null, name: null };

        const segments = decoded[line];
        const index = traceSegmentInternal(segments, map._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND);
        if (index === -1) return { source: null, line: null, column: null, name: null };

        const segment = segments[index];
        if (segment.length === 1) return { source: null, line: null, column: null, name: null };

        const { names, resolvedSources } = map;
        return {
            source: resolvedSources[segment[SOURCES_INDEX]],
            line: segment[SOURCE_LINE] + 1,
            column: segment[SOURCE_COLUMN],
            name: segment.length === 5 ? names[segment[NAMES_INDEX]] : null
        };
    }

    function generatedPositionFor(map, needle) {
        const { source, line, column, bias } = needle;
        return generatedPosition(map, source, line, column, bias || GREATEST_LOWER_BOUND, false);
    }

    function generatedPosition(map, source, line, column, bias, all) {
        line--;
        if (line < 0) throw new Error(LINE_GTR_ZERO);
        if (column < 0) throw new Error(COL_GTR_EQ_ZERO);

        const { sources, resolvedSources } = map;
        let sourceIndex = sources.indexOf(source);
        if (sourceIndex === -1) sourceIndex = resolvedSources.indexOf(source);
        if (sourceIndex === -1) return all ? [] : { line: null, column: null };

        const generated = map._bySources || (map._bySources = buildBySources(decodedMappings(map), map._bySourceMemos = sources.map(memoizedState)));
        const segments = generated[sourceIndex][line];
        if (!segments) return all ? [] : { line: null, column: null };

        const memo = map._bySourceMemos[sourceIndex];
        if (all) return sliceGeneratedPositions(segments, memo, line, column, bias);

        const index = traceSegmentInternal(segments, memo, line, column, bias);
        return index === -1 ? { line: null, column: null } : { line: segments[index][REV_GENERATED_LINE] + 1, column: segments[index][REV_GENERATED_COLUMN] };
    }

    exports.AnyMap = function (map, mapUrl) {
        const parsed = typeof map === 'string' ? JSON.parse(map) : map;
        if (!('sections' in parsed)) return new TraceMap(parsed, mapUrl);

        const mappings = [], sources = [], sourcesContent = [], names = [], ignoreList = [];
        recurse(parsed, mapUrl, mappings, sources, sourcesContent, names, ignoreList, 0, 0, Infinity, Infinity);
        
        return presortedDecodedMap({
            version: 3,
            file: parsed.file,
            names, sources, sourcesContent, mappings, ignoreList
        });
    };

    function presortedDecodedMap(map, mapUrl) {
        const tracer = new TraceMap(Object.assign({}, map), mapUrl);
        tracer._decoded = map.mappings;
        return tracer;
    }

    exports.TraceMap = TraceMap;
    exports.LEAST_UPPER_BOUND = LEAST_UPPER_BOUND;
    exports.GREATEST_LOWER_BOUND = GREATEST_LOWER_BOUND;
    exports.originalPositionFor = originalPositionFor;
    exports.generatedPositionFor = generatedPositionFor;
    exports.encodedMappings = encodedMappings;
    exports.decodedMappings = decodedMappings;

    // Additional functions and exports can be included here to manage recursive parsing and mapping operations as needed.

}));
//# sourceMappingURL=trace-mapping.umd.js.map
