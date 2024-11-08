(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.remapping = factory());
}(this, (function () {
    'use strict';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const charToInteger = Object.fromEntries([...chars].map((char, index) => [char.charCodeAt(0), index]));

    function decode(mappings) {
        const decoded = [], segment = [0, 0, 0, 0, 0];
        let line = [], value = 0, shift = 0, j = 0;

        for (let i = 0; i < mappings.length; i++) {
            const c = mappings.charCodeAt(i);
            if (c === 44) {
                segmentify(line, segment, j);
                j = 0;
            } else if (c === 59) {
                segmentify(line, segment, j);
                decoded.push(line);
                line = [];
                segment[0] = 0;
                j = 0;
            } else {
                let integer = charToInteger[c];
                if (integer === undefined) throw new Error('Invalid character (' + String.fromCharCode(c) + ')');

                const hasContinuationBit = integer & 32;
                integer &= 31;
                value += integer << shift;

                if (hasContinuationBit) {
                    shift += 5;
                } else {
                    segment[j] += (value & 1 ? -(value >> 1) : value >> 1);
                    j++;
                    value = shift = 0;
                }
            }
        }
        segmentify(line, segment, j);
        decoded.push(line);
        return decoded;
    }

    function segmentify(line, segment, j) {
        const segLen = [4, 5, 1].indexOf(j) + 1;
        if (segLen) {
            line.push(segment.slice(0, segLen));
        }
    }

    function encode(decoded) {
        const encodeInteger = (num) => {
            let result = '';
            num = num < 0 ? ((-num) << 1) | 1 : num << 1;
            do {
                let clamped = num & 31;
                num >>>= 5;
                if (num > 0) clamped |= 32;
                result += chars[clamped];
            } while (num > 0);
            return result;
        };

        let mappings = '', lastVals = Array(5).fill(0);

        decoded.forEach((line, i) => {
            if (i > 0) mappings += ';';
            if (line.length === 0) return;

            let generatedCodeColumn = 0;
            mappings += line.map(segment => {
                let result = encodeInteger(segment[0] - generatedCodeColumn);
                generatedCodeColumn = segment[0];

                if (segment.length > 1) {
                    result += encodeInteger(segment[1] - lastVals[1]) +
                               encodeInteger(segment[2] - lastVals[2]) +
                               encodeInteger(segment[3] - lastVals[3]);

                    if (segment.length === 5) {
                        result += encodeInteger(segment[4] - lastVals[4]);
                        lastVals[4] = segment[4];
                    }
                    lastVals[1] = segment[1];
                    lastVals[2] = segment[2];
                    lastVals[3] = segment[3];
                }
                return result;
            }).join(',');
        });

        return mappings;
    }

    function defaults(target, source) {
        return Object.assign(Object.create(null), source, target);
    }

    function decodeSourceMap(map) {
        map = typeof map === 'string' ? JSON.parse(map) : map;
        const { mappings } = map;
        map.mappings = typeof mappings === 'string' ? sortMappings(decode(mappings), true) : sortMappings(mappings, false);
        return defaults({ mappings }, map);
    }

    function sortMappings(mappings, owned) {
        const index = firstUnsortedSegmentLine(mappings);
        if (index === mappings.length) return mappings;

        if (!owned) mappings = mappings.slice();
        for (let i = index; i < mappings.length; i++) {
            mappings[i] = !owned ? mappings[i].slice().sort(segmentComparator) : mappings[i].sort(segmentComparator);
        }
        return mappings;
    }

    function firstUnsortedSegmentLine(mappings) {
        for (let i = 0; i < mappings.length; i++) {
            const segments = mappings[i];
            for (let j = 1; j < segments.length; j++) {
                if (segments[j][0] < segments[j - 1][0]) return i;
            }
        }
        return mappings.length;
    }

    function segmentComparator(a, b) {
        return a[0] - b[0];
    }

    class OriginalSource {
        constructor(filename, content) {
            this.filename = filename;
            this.content = content;
        }
        traceSegment(line, column, name) {
            return { column, line, name, source: this };
        }
    }

    /* istanbul ignore next */
    const Url = (typeof URL !== 'undefined' ? URL : require('url').URL);
    const parentRegex = /(^|\/)\.\.(?=\/|$)/g;

    function isAbsoluteUrl(url) {
        try {
            return !!new Url(url);
        } catch (e) {
            return false;
        }
    }

    function uniqInStr(str) {
        let uniq = String(Math.random()).slice(2);
        while (str.includes(uniq)) uniq += uniq;
        return uniq;
    }

    function stripPathFilename(path) {
        path = normalizePath(path);
        return path.slice(0, path.lastIndexOf('/') + 1);
    }

    function normalizeSimplePath(input) {
        const { href } = new Url(input, 'https://foo.com/');
        return href.slice('https://foo.com/'.length);
    }

    function normalizePath(input) {
        if (!parentRegex.test(input)) return normalizeSimplePath(input);

        let total = 1;
        while (parentRegex.test(input)) total++;

        const uniqDirectory = `z${uniqInStr(input)}/`;
        const search = new RegExp(`^(?:${uniqDirectory})*`);

        const relative = normalizeSimplePath(uniqDirectory.repeat(total) + input);

        return relative.replace(search, all => '../'.repeat(total - all.length / uniqDirectory.length));
    }

    function resolve(input, base) {
        if (!base) base = '';

        if (isAbsoluteUrl(input)) return new Url(input).href;
        if (base) {
            if (isAbsoluteUrl(base)) return new Url(input, base).href;
            if (base.startsWith('//')) return normalizeProtocolRelative(input, `https:${base}`);
        }

        if (input.startsWith('//')) return normalizeProtocolRelative(input, 'https://foo.com/');
        if (input.startsWith('/')) return '/' + normalizeSimplePath(input);

        const joined = stripPathFilename(base) + input;
        return base.startsWith('/') ? '/' + normalizeSimplePath(joined) : normalizePath(joined);
    }

    function normalizeProtocolRelative(input, absoluteBase) {
        const { href, protocol } = new Url(input, absoluteBase);
        return href.slice(protocol.length);
    }

    function resolve$1(input, base) {
        if (base && !base.endsWith('/')) base += '/';
        return resolve(input, base);
    }

    function binarySearch(haystack, needle, comparator, low, high) {
        low = Math.max(low, 0);
        while (low <= high) {
            const mid = low + ((high - low) >> 1);
            const cmp = comparator(haystack[mid], needle);
            if (cmp === 0) return mid;
            if (cmp < 0) low = mid + 1;
            else high = mid - 1;
        }
        return ~low;
    }

    class FastStringArray {
        constructor() {
            this.indexes = Object.create(null);
            this.array = [];
        }

        put(key) {
            const { array, indexes } = this;
            let index = indexes[key];

            if (index === undefined) {
                index = indexes[key] = array.length;
                array.push(key);
            }
            return index;
        }
    }

    class SourceMapTree {
        constructor(map, sources) {
            this.map = map;
            this.sources = sources;
            this.lastLine = 0;
            this.lastColumn = 0;
            this.lastIndex = 0;
        }

        traceMappings() {
            const mappings = [];
            const names = new FastStringArray();
            const sources = new FastStringArray();
            const sourcesContent = [];
            const { mappings: rootMappings, names: rootNames } = this.map;

            rootMappings.forEach((segments, i) => {
                const tracedSegments = [];
                segments.forEach(segment => {
                    if (segment.length === 1) return;

                    const source = this.sources[segment[1]];
                    const traced = source.traceSegment(segment[2], segment[3], segment.length === 5 ? rootNames[segment[4]] : '');

                    if (!traced) return;

                    const { column, line, name } = traced;
                    const { content, filename } = traced.source;
                    const sourceIndex = sources.put(filename);

                    sourcesContent[sourceIndex] = content;

                    if (name) {
                        tracedSegments.push([segment[0], sourceIndex, line, column, names.put(name)]);
                    } else {
                        tracedSegments.push([segment[0], sourceIndex, line, column]);
                    }
                });
                mappings.push(tracedSegments);
            });

            return defaults({
                mappings,
                names: names.array,
                sources: sources.array,
                sourcesContent,
            }, this.map);
        }
        
        traceSegment(line, column, name) {
            const { mappings, names } = this.map;
            if (line >= mappings.length) return null;

            const segments = mappings[line];
            if (segments.length === 0) return null;

            let low = 0, high = segments.length - 1;
            if (line === this.lastLine) {
                low = column >= this.lastColumn ? this.lastIndex : low;
                high = column < this.lastColumn ? this.lastIndex : high;
            }

            let index = binarySearch(segments, column, (segment) => segment[0] - column, low, high);
            this.lastLine = line;
            this.lastColumn = column;

            if (index === -1) return null;
            if (index < 0) index = ~index - 1;

            this.lastIndex = index;
            const segment = segments[index];
            if (segment.length === 1) return null;

            const source = this.sources[segment[1]];
            return source.traceSegment(segment[2], segment[3], segment.length === 5 ? names[segment[4]] : name);
        }
    }

    function stripFilename(path) {
        if (!path) return '';
        const index = path.lastIndexOf('/');
        return path.slice(0, index + 1);
    }

    function asArray(value) {
        return Array.isArray(value) ? value : [value];
    }

    function buildSourceMapTree(input, loader, relativeRoot) {
        const maps = asArray(input).map(decodeSourceMap);
        const map = maps.pop();

        maps.forEach((transMap, i) => {
            if (transMap.sources.length !== 1) {
                throw new Error(`Transformation map ${i} must have exactly one source file.`);
            }
        });

        const { sourceRoot, sources, sourcesContent } = map;
        const children = sources.map((sourceFile, i) => {
            const uri = resolve$1(sourceFile || '', resolve$1(sourceRoot || '', stripFilename(relativeRoot)));
            const sourceMap = loader(uri);

            if (!sourceMap) {
                const sourceContent = sourcesContent ? sourcesContent[i] : null;
                return new OriginalSource(uri, sourceContent);
            }
            return buildSourceMapTree(decodeSourceMap(sourceMap), loader, uri);
        });

        let tree = new SourceMapTree(map, children);
        for (let i = maps.length - 1; i >= 0; i--) {
            tree = new SourceMapTree(maps[i], [tree]);
        }
        return tree;
    }

    class SourceMap {
        constructor(map, options) {
            this.version = 3;
            if ('file' in map) this.file = map.file;

            this.mappings = options.decodedMappings ? map.mappings : encode(map.mappings);
            this.names = map.names;
            this.sources = map.sources;

            if (!options.excludeContent && 'sourcesContent' in map) {
                this.sourcesContent = map.sourcesContent;
            }
        }

        toString() {
            return JSON.stringify(this);
        }
    }

    function remapping(input, loader, options) {
        const opts = typeof options === 'object' ? options : { excludeContent: !!options, decodedMappings: false };
        const graph = buildSourceMapTree(input, loader);
        return new SourceMap(graph.traceMappings(), opts);
    }

    return remapping;

})));
