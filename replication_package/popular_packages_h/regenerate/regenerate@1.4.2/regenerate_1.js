/*! https://mths.be/regenerate v1.4.2 by @mathias | MIT license */
(function(root) {
  'use strict';

  // Define errors for erroneous operations
  const ERRORS = {
    rangeOrder: "A range’s `stop` value must be greater than or equal to the `start` value.",
    codePointRange: "Invalid code point value. Code points range from U+000000 to U+10FFFF.",
  };

  // Surrogate pairs range
  const HIGH_SURROGATE_MIN = 0xD800;
  const HIGH_SURROGATE_MAX = 0xDBFF;
  const LOW_SURROGATE_MIN = 0xDC00;
  const LOW_SURROGATE_MAX = 0xDFFF;

  const regexNull = /\\x00([^0123456789]|$)/g;

  // Utility functions
  const extend = (destination, source) => Object.assign(destination, source);
  const forEach = (array, callback) => array.forEach(callback);
  const pad = (number, totalCharacters) => number.toString().padStart(totalCharacters, '0');
  const hex = (number) => number.toString(16).toUpperCase();
  const isNumber = (value) => typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';

  // Data manipulation functions
  const dataFromCodePoints = (codePoints) => {
    const result = [];
    let previous = 0;
    let isStart = true;
    codePoints.forEach((tmp, index) => {
      if (isStart) {
        result.push(tmp);
        previous = tmp;
        isStart = false;
      } else {
        if (tmp === previous + 1) {
          if (index !== codePoints.length - 1) {
            previous = tmp;
            return;
          }
          isStart = true;
          result.push(tmp + 1);
        } else {
          result.push(previous + 1, tmp);
          previous = tmp;
        }
      }
    });
    if (!isStart) result.push(codePoints[codePoints.length - 1] + 1);
    return result;
  };

  const dataAdd = (data, codePoint) => {
    if (codePoint < 0x0 || codePoint > 0x10FFFF) {
      throw RangeError(ERRORS.codePointRange);
    }
    let lastIndex = null;
    for (let index = 0; index < data.length; index += 2) {
      const start = data[index];
      const end = data[index + 1];

      if (codePoint >= start && codePoint < end) {
        return data;
      }

      if (codePoint === start - 1) {
        data[index] = codePoint;
        return data;
      }

      if (start > codePoint) {
        data.splice(lastIndex != null ? lastIndex + 2 : 0, 0, codePoint, codePoint + 1);
        return data;
      }

      if (codePoint === end) {
        if (codePoint + 1 === data[index + 2]) {
          data.splice(index, 4, start, data[index + 3]);
          return data;
        }
        data[index + 1] = codePoint + 1;
        return data;
      }

      lastIndex = index;
    }
    data.push(codePoint, codePoint + 1);
    return data;
  };

  const dataRemove = (data, codePoint) => {
    for (let index = 0; index < data.length; index += 2) {
      const start = data[index];
      const end = data[index + 1];
      if (codePoint >= start && codePoint < end) {
        if (codePoint === start) {
          if (end === start + 1) data.splice(index, 2);
          else data[index] = codePoint + 1;
        } else if (codePoint === end - 1) data[index + 1] = codePoint;
        else data.splice(index, 2, start, codePoint, codePoint + 1, end);
        return data;
      }
    }
    return data;
  };

  const dataAddRange = (data, rangeStart, rangeEnd) => {
    if (rangeEnd < rangeStart) throw Error(ERRORS.rangeOrder);
    if (rangeStart < 0x0 || rangeStart > 0x10FFFF || rangeEnd < 0x0 || rangeEnd > 0x10FFFF) {
      throw RangeError(ERRORS.codePointRange);
    }
    let added = false;
    for (let index = 0; index < data.length; index += 2) {
      const start = data[index];
      const end = data[index + 1];

      if (added) {
        if (start === rangeEnd + 1) {
          data.splice(index - 1, 2);
          return data;
        }
        if (start > rangeEnd) return data;
        if (start >= rangeStart && start <= rangeEnd) {
          if (end > rangeStart && end - 1 <= rangeEnd) data.splice(index, 2);
          else data.splice(index - 1, 2);
        }
      } else if (start === rangeEnd + 1 || start === rangeEnd) {
        data[index] = rangeStart;
        return data;
      } else if (start > rangeEnd) {
        data.splice(index, 0, rangeStart, rangeEnd + 1);
        return data;
      } else if (rangeStart >= start && rangeStart < end && rangeEnd + 1 <= end) {
        return data;
      } else if ((rangeStart >= start && rangeStart < end) || end === rangeStart) {
        data[index + 1] = rangeEnd + 1;
        added = true;
      } else if (rangeStart <= start && rangeEnd + 1 >= end) {
        data[index] = rangeStart;
        data[index + 1] = rangeEnd + 1;
        added = true;
      }
    }
    if (!added) data.push(rangeStart, rangeEnd + 1);
    return data;
  };

  const dataRemoveRange = (data, rangeStart, rangeEnd) => {
    if (rangeEnd < rangeStart) throw Error(ERRORS.rangeOrder);
    for (let index = 0; index < data.length; index += 2) {
      const start = data[index];
      const end = data[index + 1] - 1;
      if (start > rangeEnd) return data;
      if (rangeStart <= start && rangeEnd >= end) data.splice(index, 2);
      else if (rangeStart >= start && rangeEnd < end) {
        if (rangeStart === start) {
          data[index] = rangeEnd + 1;
          data[index + 1] = end + 1;
        } else data.splice(index, 2, start, rangeStart, rangeEnd + 1, end + 1);
        return data;
      } else if (rangeStart >= start && rangeStart <= end) data[index + 1] = rangeStart;
      else if (rangeEnd >= start && rangeEnd <= end) {
        data[index] = rangeEnd + 1;
        return data;
      }
    }
    return data;
  };

  const dataContains = (data, codePoint) => {
    if (data.length < 2 || codePoint < data[0] || codePoint > data[data.length - 1]) {
      return false;
    }
    for (let index = 0; index < data.length; index += 2) {
      if (codePoint >= data[index] && codePoint < data[index + 1]) return true;
    }
    return false;
  };

  // Character class creation functions
  const codePointToString = (codePoint) => {
    if (codePoint <= 0xFF) return '\\x' + pad(hex(codePoint), 2);
    return '\\u' + pad(hex(codePoint), 4);
  };

  const codePointToStringUnicode = (codePoint) => {
    return codePoint <= 0xFFFF ? codePointToString(codePoint) : '\\u{' + codePoint.toString(16).toUpperCase() + '}';
  };

  const createBMPCharacterClasses = (data) => {
    let result = '';
    for (let index = 0; index < data.length; index += 2) {
      const start = data[index];
      const end = data[index + 1] - 1;
      if (start === end) result += codePointToString(start);
      else if (start + 1 === end) result += codePointToString(start) + codePointToString(end);
      else result += codePointToString(start) + '-' + codePointToString(end);
    }
    return '[' + result + ']';
  };

  const createUnicodeCharacterClasses = (data) => {
    let result = '';
    for (let index = 0; index < data.length; index += 2) {
      const start = data[index];
      const end = data[index + 1] - 1;
      if (start === end) result += codePointToStringUnicode(start);
      else if (start + 1 === end) result += codePointToStringUnicode(start) + codePointToStringUnicode(end);
      else result += codePointToStringUnicode(start) + '-' + codePointToStringUnicode(end);
    }
    return '[' + result + ']';
  };

  // Main `regenerate` function acting as a constructor and a callable function
  function regenerate(value) {
    if (arguments.length > 1) value = Array.prototype.slice.call(arguments);
    if (this instanceof regenerate) {
      this.data = [];
      return value ? this.add(value) : this;
    }
    return new regenerate().add(value);
  }

  regenerate.version = '1.4.2';

  const proto = regenerate.prototype;
  extend(proto, {
    add(value) {
      if (value == null) return this;
      if (value instanceof regenerate) this.data = dataAddData(this.data, value.data);
      else Array.isArray(value) ? value.forEach((v) => this.add(v)) : this.data = dataAdd(this.data, isNumber(value) ? value : symbolToCodePoint(value));
      return this;
    },
    remove(value) {
      if (value == null) return this;
      if (value instanceof regenerate) this.data = dataRemoveData(this.data, value.data);
      else Array.isArray(value) ? value.forEach((v) => this.remove(v)) : this.data = dataRemove(this.data, isNumber(value) ? value : symbolToCodePoint(value));
      return this;
    },
    addRange(start, end) {
      this.data = dataAddRange(this.data, isNumber(start) ? start : symbolToCodePoint(start), isNumber(end) ? end : symbolToCodePoint(end));
      return this;
    },
    removeRange(start, end) {
      this.data = dataRemoveRange(this.data, isNumber(start) ? start : symbolToCodePoint(start), isNumber(end) ? end : symbolToCodePoint(end));
      return this;
    },
    intersection(argument) {
      this.data = dataIntersection(this.data, argument instanceof regenerate ? dataToArray(argument.data) : argument);
      return this;
    },
    contains(codePoint) {
      return dataContains(this.data, isNumber(codePoint) ? codePoint : symbolToCodePoint(codePoint));
    },
    clone() {
      const set = new regenerate();
      set.data = this.data.slice();
      return set;
    },
    toString(options = {}) {
      let result = createCharacterClassesFromData(this.data, options.bmpOnly, options.hasUnicodeFlag);
      return result ? result.replace(regexNull, '\\0$1') : '[]';
    },
    toRegExp(flags) {
      const pattern = this.toString(flags && flags.includes('u') ? { hasUnicodeFlag: true } : null);
      return new RegExp(pattern, flags || '');
    },
    valueOf() { // Note: `valueOf` is aliased as `toArray`.
      return dataToArray(this.data);
    }
  });

  proto.toArray = proto.valueOf;

  // Detect module system and export regenerate
  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(function() {
      return regenerate;
    });
  } else if (typeof exports === 'object' && exports) {
    if (typeof module === 'object' && module && module.exports === exports) {
      module.exports = regenerate;
    } else {
      exports.regenerate = regenerate;
    }
  } else {
    root.regenerate = regenerate;
  }
}(this));
