(function (root) {
    const errors = {
        'rangeOrder': 'A range’ start must be less than or equal to stop.',
        'codePointRange': 'Code point out of range. Valid range is U+000000 to U+10FFFF.'
    };

    const HIGH_SURROGATE_MIN = 0xD800;
    const HIGH_SURROGATE_MAX = 0xDBFF;
    const LOW_SURROGATE_MIN = 0xDC00;
    const LOW_SURROGATE_MAX = 0xDFFF;

    const objectProto = Object.prototype;
    const toString = objectProto.toString;
    const hasOwnProperty = objectProto.hasOwnProperty;

    const isArray = value => toString.call(value) === '[object Array]';
    const isNumber = value => typeof value === 'number' || toString.call(value) === '[object Number]';

    const padHex = (number, width) => number.toString(16).toUpperCase().padStart(width, '0');
    const slice = Array.prototype.slice;

    const dataAdd = (data, codePoint) => {
        if (codePoint < 0x0 || codePoint > 0x10FFFF) throw RangeError(errors.codePointRange);

        let index = 0;
        const length = data.length;

        while (index < length) {
            const start = data[index];
            const end = data[index + 1];

            if (codePoint >= start && codePoint < end) return data;
            if (codePoint === start - 1) {
                data[index] = codePoint;
                return data;
            }
            if (codePoint === end) {
                if (codePoint + 1 === data[index + 2]) {
                    data.splice(index, 4, start, data[index + 3]);
                } else {
                    data[index + 1] = codePoint + 1;
                }
                return data;
            }
            if (start > codePoint) {
                data.splice(index, 0, codePoint, codePoint + 1);
                return data;
            }

            index += 2;
        }

        data.push(codePoint, codePoint + 1);
        return data;
    };

    const dataRemove = (data, codePoint) => {
        let index = 0;
        while (index < data.length) {
            const start = data[index];
            const end = data[index + 1];
            if (codePoint >= start && codePoint < end) {
                if (codePoint === start) {
                    end - start === 1 ? data.splice(index, 2) : (data[index] = codePoint + 1);
                } else if (codePoint === end - 1) {
                    data[index + 1] = codePoint;
                } else {
                    data.splice(index, 2, start, codePoint, codePoint + 1, end);
                }
                return data;
            }
            index += 2;
        }
        return data;
    };

    const dataRemoveRange = (data, rangeStart, rangeEnd) => {
        if (rangeEnd < rangeStart) throw Error(errors.rangeOrder);
        let index = 0;
        while (index < data.length) {
            const start = data[index];
            const end = data[index + 1] - 1;
            if (start > rangeEnd) return data;

            if (rangeStart <= start && rangeEnd >= end) {
                data.splice(index, 2);
            } else if (rangeStart >= start && rangeEnd < end) {
                rangeStart === start ? data[index] = rangeEnd + 1 : data.splice(index, 2, start, rangeStart, rangeEnd + 1, end + 1);
                return data;
            } else if (rangeStart >= start && rangeStart <= end) {
                data[index + 1] = rangeStart;
            } else if (rangeEnd >= start && rangeEnd <= end) {
                data[index] = rangeEnd + 1;
                return data;
            }

            index += 2;
        }
        return data;
    };

    const dataAddRange = (data, rangeStart, rangeEnd) => {
        if (rangeEnd < rangeStart) throw Error(errors.rangeOrder);
        if (rangeStart < 0x0 || rangeStart > 0x10FFFF || rangeEnd < 0x0 || rangeEnd > 0x10FFFF) throw RangeError(errors.codePointRange);

        let index = 0;
        const length = data.length;
        let added = false;

        while (index < length) {
            const start = data[index];
            const end = data[index + 1];

            if (added) {
                if (start === rangeEnd + 1) {
                    data.splice(index - 1, 2);
                    return data;
                }
                if (start > rangeEnd) return data;
                if (start >= rangeStart && start <= rangeEnd && (end - 1 <= rangeEnd)) {
                    data.splice(index, 2);
                    index -= 2;
                } else if (start >= rangeStart && start <= rangeEnd) {
                    data.splice(index - 1, 2);
                    index -= 2;
                }
            }
            else if (start === rangeEnd + 1 || start === rangeEnd) {
                data[index] = rangeStart;
                return data;
            } else if (start > rangeEnd) {
                data.splice(index, 0, rangeStart, rangeEnd + 1);
                return data;
            } else if (rangeStart >= start && rangeStart < end && rangeEnd + 1 <= end) {
                return data;
            } else if (rangeStart >= start && rangeStart < end || end === rangeStart) {
                data[index + 1] = rangeEnd + 1;
                added = true;
            } else if (rangeStart <= start && rangeEnd + 1 >= end) {
                data[index] = rangeStart;
                data[index + 1] = rangeEnd + 1;
                added = true;
            }

            index += 2;
        }

        if (!added) data.push(rangeStart, rangeEnd + 1);
        return data;
    };

    const dataContains = (data, codePoint) => {
        let index = 0;
        while (index < data.length) {
            const start = data[index];
            const end = data[index + 1];
            if (codePoint >= start && codePoint < end) return true;
            index += 2;
        }
        return false;
    };

    const dataToArray = (data) => {
        const result = [];
        let index = 0;
        while (index < data.length) {
            let start = data[index];
            const end = data[index + 1];
            while (start < end) result.push(start++);
            index += 2;
        }
        return result;
    };

    const createCharacterClasses = (data, bmpOnly, hasUnicodeFlag) => {
        const result = [];
        let index = 0;

        while (index < data.length) {
            const start = data[index];
            const end = data[index + 1] - 1;
            if (start === end) {
                result.push(padHex(start, 2));
            } else if (start + 1 === end) {
                result.push(padHex(start, 2), padHex(end, 2));
            } else {
                result.push(`${padHex(start, 2)}-${padHex(end, 2)}`);
            }
            index += 2;
        }
        return `[${result.join('')}]`;
    };

    function Regenerate(value) {
        if (!(this instanceof Regenerate)) {
            return new Regenerate(value);
        }
        this.data = [];
        if (value != null) this.add(value);
    }

    Regenerate.prototype = {
        add(value) {
            if (value == null) return this;
            if (value instanceof Regenerate) {
                this.data = dataAdd(this.data, value.data);
                return this;
            }
            if (isArray(value)) {
                value.forEach(item => this.add(item));
                return this;
            }
            this.data = dataAdd(this.data, isNumber(value) ? value : value.codePointAt(0));
            return this;
        },
        remove(value) {
            if (value == null) return this;
            if (value instanceof Regenerate) {
                this.data = dataRemove(this.data, value.data);
                return this;
            }
            if (isArray(value)) {
                value.forEach(item => this.remove(item));
                return this;
            }
            this.data = dataRemove(this.data, isNumber(value) ? value : value.codePointAt(0));
            return this;
        },
        contains(codePoint) {
            return dataContains(this.data, isNumber(codePoint) ? codePoint : codePoint.codePointAt(0));
        },
        toString(options) {
            const pattern = createCharacterClasses(this.data, options && options.bmpOnly, options && options.hasUnicodeFlag);
            return pattern || '[]';
        },
        valueOf() {
            return dataToArray(this.data);
        },
        toRegExp(flags) {
            return new RegExp(this.toString(flags && flags.includes('u') ? { hasUnicodeFlag: true } : {}), flags || '');
        }
    };

    if (typeof define === 'function' && define.amd) {
        define(() => Regenerate);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = Regenerate;
    } else {
        root.Regenerate = Regenerate;
    }
}(this));
