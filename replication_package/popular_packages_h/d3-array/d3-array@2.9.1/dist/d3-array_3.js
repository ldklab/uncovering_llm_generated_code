(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}));
}(this, (function (exports) {
    'use strict';

    // Utility functions for array sorting and searching
    function ascending(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    function bisector(f) {
        let compare = f.length === 1 ? (a, b) => ascending(f(a), b) : ascending;
        return {
            left(array, x, lo = 0, hi = array.length) {
                while (lo < hi) {
                    const mid = (lo + hi) >>> 1;
                    if (compare(array[mid], x) < 0) lo = mid + 1;
                    else hi = mid;
                }
                return lo;
            },
            right(array, x, lo = 0, hi = array.length) {
                while (lo < hi) {
                    const mid = (lo + hi) >>> 1;
                    if (compare(array[mid], x) > 0) hi = mid;
                    else lo = mid + 1;
                }
                return lo;
            }
        };
    }

    // Numeric and statistical utilities
    function number(x) {
        return x === null ? NaN : +x;
    }

    function* numbers(values, valueof) {
        for (let value, i = 0, n = values.length; i < n; ++i) {
            if ((value = valueof ? valueof(values[i], i, values) : values[i]) != null && !isNaN(value = +value)) {
                yield value;
            }
        }
    }

    function count(array) {
        return array.reduce((acc, x) => acc + (x != null && x === +x), 0);
    }

    function extent(values, valueof) {
        let min, max;
        for (const value of values) {
            if (value != null) {
                const v = valueof ? valueof(value) : value;
                if (min === undefined) { min = max = v; }
                else {
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
        }
        return [min, max];
    }

    // Statistical functions
    function variance(values) {
        let mean = 0, sum = 0, count = 0;
        for (const x of values) {
            if (x != null) {
                let delta = x - mean;
                mean += delta / ++count;
                sum += delta * (x - mean);
            }
        }
        return count > 1 ? sum / (count - 1) : undefined;
    }

    function deviation(values) {
        const v = variance(values);
        return v ? Math.sqrt(v) : undefined;
    }

    function mean(values) {
        let sum = 0, count = 0;
        for (const x of values) {
            if (x != null && !isNaN(x = +x)) {
                sum += x, ++count;
            }
        }
        return count ? sum / count : undefined;
    }

    function median(values) {
        return quantile(values, 0.5);
    }

    function quantile(values, p) {
        let n = values.length;
        if (!n) return;
        values = Float64Array.from(numbers(values));
        if ((p = +p) <= 0 || n < 2) return Math.min(...values);
        if (p >= 1) return Math.max(...values);
        let i = (n - 1) * p, i0 = Math.floor(i), value0 = values[i0], value1 = values[i0 + 1];
        return value0 + (value1 - value0) * (i - i0);
    }

    // Bin and histogram utilities
    function bin() {
        let value = identity, domain = extent, threshold = sturges;
        return function(data) {
            const values = data.map(value);
            const [x0, x1] = domain(values), thresholds = threshold(values, x0, x1);
            return thresholds.reduce((bins, threshold, i) => {
                const b = bins[i] || (bins[i] = []);
                for (const d of data) if (value(d) < threshold && value(d) >= (bins[i-1]?.bin ?? x0)) b.push(d);
                b.bin = threshold;
                return bins;
            }, []);
        };
    }

    // Statistical thresholds for data binning
    function sturges(values) {
        return Math.ceil(Math.log2(count(values)) + 1);
    }

    // Array-like and range utilities
    function range(start, stop, step = 1) {
        let n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
        return Array.from({ length: n }, (_, i) => start + i * step);
    }

    function transpose(matrix) {
        if (!matrix.length) return [];
        const [m, n] = [matrix.length, Math.min(...matrix.map(length => length))];
        return Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => matrix[j][i]));
    }

    // Helper function for exporting module
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.ascending = ascending;
    exports.bisector = bisector;
    exports.number = number;
    exports.count = count;
    exports.extent = extent;
    exports.variance = variance;
    exports.deviation = deviation;
    exports.mean = mean;
    exports.median = median;
    exports.quantile = quantile;
    exports.bin = bin;
    exports.sturges = sturges;
    exports.range = range;
    exports.transpose = transpose;
})));

