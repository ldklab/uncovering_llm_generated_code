(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jridgewell/sourcemap-codec'), require('@jridgewell/resolve-uri')) :
    typeof define === 'function' && define.amd ? define(['exports', '@jridgewell/sourcemap-codec', '@jridgewell/resolve-uri'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.traceMapping = {}, global.sourcemapCodec, global.resolveURI));
})(this, (function (exports, sourcemapCodec, resolveUri) {
    'use strict';

    function resolve(input, base) {
        if (base && !base.endsWith('/')) base += '/';
        return resolveUri(input, base);
    }

    function stripFilename(path) {
        if (!path) return '';
        const index = path.lastIndexOf('/');
        return path.slice(0, index + 1);
    }

    const COLUMN = 0;
    const SOURCES_INDEX = 1;
    const SOURCE_LINE = 2;
    const SOURCE_COLUMN = 3;
    const NAMES_INDEX = 4;
    const REV_GENERATED_LINE = 1;
    const REV_GENERATED_COLUMN = 2;

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
        if (!owned) line = line.slice();
        return line.sort(sortComparator);
    }

    function sortComparator(a, b) {
        return a[COLUMN] - b[COLUMN];
    }

    let found = false;

    function binarySearch(haystack, needle, low, high) {
        while (low <= high) {
            const mid = low + ((high - low) >> 1);
            const cmp = haystack[mid][COLUMN] - needle;
            if (cmp === 0) {
                found = true;
                return mid;
            }
            cmp < 0 ? low = mid + 1 : high = mid - 1;
        }
        found = false;
        return low - 1;
    }

    function upperBound(haystack, needle, index) {
        for (let i = index + 1; i < haystack.length; index = i++) {
            if (haystack[i][COLUMN] !== needle) break;
        }
        return index;
    }

    function lowerBound(haystack, needle, index) {
        for (let i = index - 1; i >= 0; index = i--) {
            if (haystack[i][COLUMN] !== needle) break;
        }
        return index;
    }

    function memoizedState() {
        return {
            lastKey: -1,
            lastNeedle: -1,
            lastIndex: -1,
        };
    }

    function memoizedBinarySearch(haystack, needle, state, key) {
        const { lastKey, lastNeedle, lastIndex } = state;
        let low = 0;
        let high = haystack.length - 1;

        if (key === lastKey) {
            if (needle === lastNeedle) {
                found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle;
                return lastIndex;
            }
            if (needle >= lastNeedle) {
                low = lastIndex === -1 ? 0 : lastIndex;
            } else {
                high = lastIndex;
            }
        }
        state.lastKey = key;
        state.lastNeedle = needle;
        return (state.lastIndex = binarySearch(haystack, needle, low, high));
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
                const originalLine = (originalSource[sourceLine] || (originalSource[sourceLine] = []));
                const memo = memos[sourceIndex];
                let index = upperBound(originalLine, sourceColumn, memoizedBinarySearch(originalLine, sourceColumn, memo, sourceLine));
                memo.lastIndex = ++index;
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

    function buildNullArray() {
        return { __proto__: null };
    }

    const AnyMap = function (map, mapUrl) {
        const parsed = parse(map);
        if (!('sections' in parsed)) {
            return new TraceMap(parsed, mapUrl);
        }
        const mappings = [];
        const sources = [];
        const sourcesContent = [];
        const names = [];
        const ignoreList = [];
        recurse(parsed, mapUrl, mappings, sources, sourcesContent, names, ignoreList, 0, 0, Infinity, Infinity);

        const joined = {
            version: 3,
            file: parsed.file,
            names,
            sources,
            sourcesContent,
            mappings,
            ignoreList,
        };

        return presortedDecodedMap(joined);
    };

    function parse(map) {
        return typeof map === 'string' ? JSON.parse(map) : map;
    }

    function recurse(input, mapUrl, mappings, sources, sourcesContent, names, ignoreList, lineOffset, columnOffset, stopLine, stopColumn) {
        const { sections } = input;
        for (let i = 0; i < sections.length; i++) {
            const { map, offset } = sections[i];
            let sl = stopLine;
            let sc = stopColumn;
            if (i + 1 < sections.length) {
                const nextOffset = sections[i + 1].offset;
                sl = Math.min(stopLine, lineOffset + nextOffset.line);
                if (sl === stopLine) {
                    sc = Math.min(stopColumn, columnOffset + nextOffset.column);
                } else if (sl < stopLine) {
                    sc = columnOffset + nextOffset.column;
                }
            }
            addSection(map, mapUrl, mappings, sources, sourcesContent, names, ignoreList, lineOffset + offset.line, columnOffset + offset.column, sl, sc);
        }
    }

    function addSection(input, mapUrl, mappings, sources, sourcesContent, names, ignoreList, lineOffset, columnOffset, stopLine, stopColumn) {
        const parsed = parse(input);
        if ('sections' in parsed) return recurse(...arguments);
        const map = new TraceMap(parsed, mapUrl);
        const sourcesOffset = sources.length;
        const namesOffset = names.length;
        const decoded = decodedMappings(map);
        const { resolvedSources, sourcesContent: contents, ignoreList: ignores } = map;
        append(sources, resolvedSources);
        append(names, map.names);
        if (contents) append(sourcesContent, contents);
        else for (let i = 0; i < resolvedSources.length; i++) sourcesContent.push(null);
        if (ignores) for (let i = 0; i < ignores.length; i++) ignoreList.push(ignores[i] + sourcesOffset);
        for (let i = 0; i < decoded.length; i++) {
            const lineI = lineOffset + i;
            if (lineI > stopLine) return;
            const out = getLine(mappings, lineI);
            const cOffset = i === 0 ? columnOffset : 0;
            const line = decoded[i];
            for (let j = 0; j < line.length; j++) {
                const seg = line[j];
                const column = cOffset + seg[COLUMN];
                if (lineI === stopLine && column >= stopColumn) return;
                if (seg.length === 1) {
                    out.push([column]);
                    continue;
                }
                const sourcesIndex = sourcesOffset + seg[SOURCES_INDEX];
                const sourceLine = seg[SOURCE_LINE];
                const sourceColumn = seg[SOURCE_COLUMN];
                out.push(seg.length === 4
                    ? [column, sourcesIndex, sourceLine, sourceColumn]
                    : [column, sourcesIndex, sourceLine, sourceColumn, namesOffset + seg[NAMES_INDEX]]
                );
            }
        }
    }

    function append(arr, other) {
        for (let i = 0; i < other.length; i++) arr.push(other[i]);
    }

    function getLine(arr, index) {
        for (let i = arr.length; i <= index; i++) arr[i] = [];
        return arr[index];
    }

    const LINE_GTR_ZERO = '`line` must be greater than 0 (lines start at line 1)';
    const COL_GTR_EQ_ZERO = '`column` must be greater than or equal to 0 (columns start at column 0)';
    const LEAST_UPPER_BOUND = -1;
    const GREATEST_LOWER_BOUND = 1;

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
            this.resolvedSources = sources.map((s) => resolve(s || '', from));
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

    function cast(map) {
        return map;
    }

    function encodedMappings(map) {
        var _a, _b;
        return ((_a = (_b = cast(map))._encoded) !== null && _a !== void 0 ? _a : (_b._encoded = sourcemapCodec.encode(cast(map)._decoded)));
    }

    function decodedMappings(map) {
        var _a;
        return ((_a = cast(map))._decoded || (_a._decoded = sourcemapCodec.decode(cast(map)._encoded)));
    }

    function traceSegment(map, line, column) {
        const decoded = decodedMappings(map);
        if (line >= decoded.length) return null;
        const segments = decoded[line];
        const index = traceSegmentInternal(segments, cast(map)._decodedMemo, line, column, GREATEST_LOWER_BOUND);
        return index === -1 ? null : segments[index];
    }

    function originalPositionFor(map, needle) {
        let { line, column, bias } = needle;
        line--;
        if (line < 0) throw new Error(LINE_GTR_ZERO);
        if (column < 0) throw new Error(COL_GTR_EQ_ZERO);
        const decoded = decodedMappings(map);
        if (line >= decoded.length) return OMapping(null, null, null, null);
        const segments = decoded[line];
        const index = traceSegmentInternal(segments, cast(map)._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND);
        if (index === -1) return OMapping(null, null, null, null);
        const segment = segments[index];
        if (segment.length === 1) return OMapping(null, null, null, null);
        const { names, resolvedSources } = map;
        return OMapping(
            resolvedSources[segment[SOURCES_INDEX]],
            segment[SOURCE_LINE] + 1,
            segment[SOURCE_COLUMN],
            segment.length === 5 ? names[segment[NAMES_INDEX]] : null
        );
    }

    function generatedPositionFor(map, needle) {
        const { source, line, column, bias } = needle;
        return generatedPosition(map, source, line, column, bias || GREATEST_LOWER_BOUND, false);
    }

    function allGeneratedPositionsFor(map, needle) {
        const { source, line, column, bias } = needle;
        return generatedPosition(map, source, line, column, bias || LEAST_UPPER_BOUND, true);
    }

    function eachMapping(map, cb) {
        const decoded = decodedMappings(map);
        const { names, resolvedSources } = map;
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            for (let j = 0; j < line.length; j++) {
                const seg = line[j];
                const generatedLine = i + 1;
                const generatedColumn = seg[0];
                let source = null;
                let originalLine = null;
                let originalColumn = null;
                let name = null;
                if (seg.length !== 1) {
                    source = resolvedSources[seg[1]];
                    originalLine = seg[2] + 1;
                    originalColumn = seg[3];
                }
                if (seg.length === 5) name = names[seg[4]];
                cb({
                    generatedLine,
                    generatedColumn,
                    source,
                    originalLine,
                    originalColumn,
                    name,
                });
            }
        }
    }

    function sourceIndex(map, source) {
        const { sources, resolvedSources } = map;
        let index = sources.indexOf(source);
        if (index === -1) index = resolvedSources.indexOf(source);
        return index;
    }

    function sourceContentFor(map, source) {
        const { sourcesContent } = map;
        if (sourcesContent == null) return null;
        const index = sourceIndex(map, source);
        return index === -1 ? null : sourcesContent[index];
    }

    function isIgnored(map, source) {
        const { ignoreList } = map;
        if (ignoreList == null) return false;
        const index = sourceIndex(map, source);
        return index === -1 ? false : ignoreList.includes(index);
    }

    function presortedDecodedMap(map, mapUrl) {
        const tracer = new TraceMap(clone(map, []), mapUrl);
        cast(tracer)._decoded = map.mappings;
        return tracer;
    }

    function decodedMap(map) {
        return clone(map, decodedMappings(map));
    }

    function encodedMap(map) {
        return clone(map, encodedMappings(map));
    }

    function clone(map, mappings) {
        return {
            version: map.version,
            file: map.file,
            names: map.names,
            sourceRoot: map.sourceRoot,
            sources: map.sources,
            sourcesContent: map.sourcesContent,
            mappings,
            ignoreList: map.ignoreList || map.x_google_ignoreList,
        };
    }

    function OMapping(source, line, column, name) {
        return { source, line, column, name };
    }

    function GMapping(line, column) {
        return { line, column };
    }

    function traceSegmentInternal(segments, memo, line, column, bias) {
        let index = memoizedBinarySearch(segments, column, memo, line);
        if (found) {
            index = (bias === LEAST_UPPER_BOUND ? upperBound : lowerBound)(segments, column, index);
        } else if (bias === LEAST_UPPER_BOUND) index++;
        if (index === -1 || index === segments.length) return -1;
        return index;
    }

    function sliceGeneratedPositions(segments, memo, line, column, bias) {
        let min = traceSegmentInternal(segments, memo, line, column, GREATEST_LOWER_BOUND);
        if (!found && bias === LEAST_UPPER_BOUND) min++;
        if (min === -1 || min === segments.length) return [];
        const matchedColumn = found ? column : segments[min][COLUMN];
        if (!found) min = lowerBound(segments, matchedColumn, min);
        const max = upperBound(segments, matchedColumn, min);

        const result = [];
        for (; min <= max; min++) {
            const segment = segments[min];
            result.push(GMapping(segment[REV_GENERATED_LINE] + 1, segment[REV_GENERATED_COLUMN]));
        }
        return result;
    }

    function generatedPosition(map, source, line, column, bias, all) {
        var _a;
        line--;
        if (line < 0) throw new Error(LINE_GTR_ZERO);
        if (column < 0) throw new Error(COL_GTR_EQ_ZERO);

        const { sources, resolvedSources } = map;
        let sourceIndex = sources.indexOf(source);
        if (sourceIndex === -1) sourceIndex = resolvedSources.indexOf(source);
        if (sourceIndex === -1) return all ? [] : GMapping(null, null);

        const generated = ((_a = cast(map))._bySources || (_a._bySources = buildBySources(decodedMappings(map), (cast(map)._bySourceMemos = sources.map(memoizedState)))));

        const segments = generated[sourceIndex][line];
        if (segments == null) return all ? [] : GMapping(null, null);

        const memo = cast(map)._bySourceMemos[sourceIndex];
        if (all) return sliceGeneratedPositions(segments, memo, line, column, bias);

        const index = traceSegmentInternal(segments, memo, line, column, bias);
        if (index === -1) return GMapping(null, null);
        const segment = segments[index];

        return GMapping(segment[REV_GENERATED_LINE] + 1, segment[REV_GENERATED_COLUMN]);
    }

    exports.AnyMap = AnyMap;
    exports.GREATEST_LOWER_BOUND = GREATEST_LOWER_BOUND;
    exports.LEAST_UPPER_BOUND = LEAST_UPPER_BOUND;
    exports.TraceMap = TraceMap;
    exports.allGeneratedPositionsFor = allGeneratedPositionsFor;
    exports.decodedMap = decodedMap;
    exports.decodedMappings = decodedMappings;
    exports.eachMapping = eachMapping;
    exports.encodedMap = encodedMap;
    exports.encodedMappings = encodedMappings;
    exports.generatedPositionFor = generatedPositionFor;
    exports.isIgnored = isIgnored;
    exports.originalPositionFor = originalPositionFor;
    exports.presortedDecodedMap = presortedDecodedMap;
    exports.sourceContentFor = sourceContentFor;
    exports.traceSegment = traceSegment;
}));
//# sourceMappingURL=trace-mapping.umd.js.map