(function(root) {
    var freeExports = typeof exports == 'object' && exports;
    var freeModule = typeof module == 'object' && module &&
        module.exports == freeExports && module;

    var freeGlobal = typeof global == 'object' && global;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        root = freeGlobal;
    }

    var ERRORS = {
        'rangeOrder': 'A range’s `stop` value must be greater than or equal to the `start` value.',
        'codePointRange': 'Invalid code point value. Code points range from U+000000 to U+10FFFF.'
    };

    var HIGH_SURROGATE_MIN = 0xD800;
    var LOW_SURROGATE_MIN = 0xDC00;
    var LOW_SURROGATE_MAX = 0xDFFF;

    var object = {};
    var hasOwnProperty = object.hasOwnProperty;

    var extend = function(destination, source) {
        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                destination[key] = source[key];
            }
        }
        return destination;
    };

    var forEach = function(array, callback) {
        var index = -1;
        var length = array.length;
        while (++index < length) {
            callback(array[index], index);
        }
    };

    var toString = object.toString;

    var isArray = function(value) {
        return toString.call(value) == '[object Array]';
    };

    var isNumber = function(value) {
        return typeof value == 'number' || toString.call(value) == '[object Number]';
    };

    var zeroes = '0000';
    var pad = function(number, totalCharacters) {
        var string = String(number);
        return string.length < totalCharacters 
            ? (zeroes + string).slice(-totalCharacters)
            : string;
    };

    var hex = function(number) {
        return Number(number).toString(16).toUpperCase();
    };

    var slice = [].slice;

    var floor = Math.floor;
    var highSurrogate = function(codePoint) {
        return parseInt(floor((codePoint - 0x10000) / 0x400) + HIGH_SURROGATE_MIN, 10);
    };

    var lowSurrogate = function(codePoint) {
        return parseInt((codePoint - 0x10000) % 0x400 + LOW_SURROGATE_MIN, 10);
    };

    var stringFromCharCode = String.fromCharCode;
    var codePointToString = function(codePoint) {
        var string;
        if (codePoint == 0x09) {
            string = '\\t';
        } else if (codePoint == 0x0A) {
            string = '\\n';
        } else if (codePoint == 0x0D) {
            string = '\\r';
        } else if (codePoint == 0x2D) {
            string = '\\x2D';
        } else if (codePoint == 0x5C) {
            string = '\\\\';
        } else if (
            codePoint == 0x24 ||
            (codePoint >= 0x28 && codePoint <= 0x2B) ||
            codePoint == 0x2E || codePoint == 0x2F ||
            codePoint == 0x3F ||
            (codePoint >= 0x5B && codePoint <= 0x5E) ||
            (codePoint >= 0x7B && codePoint <= 0x7D)
        ) {
            string = '\\' + stringFromCharCode(codePoint);
        } else if (codePoint >= 0x20 && codePoint <= 0x7E) {
            string = stringFromCharCode(codePoint);
        } else if (codePoint <= 0xFF) {
            string = '\\x' + pad(hex(codePoint), 2);
        } else {
            string = '\\u' + pad(hex(codePoint), 4);
        }
        return string;
    };

    var codePointToStringUnicode = function(codePoint) {
        if (codePoint <= 0xFFFF) {
            return codePointToString(codePoint);
        }
        return '\\u{' + codePoint.toString(16).toUpperCase() + '}';
    };

    var symbolToCodePoint = function(symbol) {
        var length = symbol.length;
        var first = symbol.charCodeAt(0);
        if (
            first >= HIGH_SURROGATE_MIN && first <= HIGH_SURROGATE_MAX &&
            length > 1
        ) {
            var second = symbol.charCodeAt(1);
            return (first - HIGH_SURROGATE_MIN) * 0x400 + second - LOW_SURROGATE_MIN + 0x10000;
        }
        return first;
    };

    var createBMPCharacterClasses = function(data) {
        var result = '';
        var index = 0;
        var length = data.length;
        while (index < length) {
            var start = data[index];
            var end = data[index + 1] - 1;
            if (start == end) {
                result += codePointToString(start);
            } else if (start + 1 == end) {
                result += codePointToString(start) + codePointToString(end);
            } else {
                result += codePointToString(start) + '-' + codePointToString(end);
            }
            index += 2;
        }
        return '[' + result + ']';
    };

    var createUnicodeCharacterClasses = function(data) {
        var result = '';
        var index = 0;
        var length = data.length;
        while (index < length) {
            var start = data[index];
            var end = data[index + 1] - 1;
            if (start == end) {
                result += codePointToStringUnicode(start);
            } else if (start + 1 == end) {
                result += codePointToStringUnicode(start) + codePointToStringUnicode(end);
            } else {
                result += codePointToStringUnicode(start) + '-' + codePointToStringUnicode(end);
            }
            index += 2;
        }
        return '[' + result + ']';
    };

    var regenerate = function(value) {
        if (arguments.length > 1) {
            value = slice.call(arguments);
        }
        if (this instanceof regenerate) {
            this.data = [];
            return value ? this.add(value) : this;
        }
        return (new regenerate).add(value);
    };

    regenerate.version = '1.4.2';

    var proto = regenerate.prototype;
    extend(proto, {
        'add': function(value) {
            var $this = this;
            if (value == null) {
                return $this;
            }
            if (value instanceof regenerate) {
                $this.data = dataAddData($this.data, value.data);
                return $this;
            }
            if (arguments.length > 1) {
                value = slice.call(arguments);
            }
            if (isArray(value)) {
                forEach(value, function(item) {
                    $this.add(item);
                });
                return $this;
            }
            $this.data = dataAdd($this.data, isNumber(value) ? value : symbolToCodePoint(value));
            return $this;
        },
        'remove': function(value) {
            var $this = this;
            if (value == null) {
                return $this;
            }
            if (value instanceof regenerate) {
                $this.data = dataRemoveData($this.data, value.data);
                return $this;
            }
            if (arguments.length > 1) {
                value = slice.call(arguments);
            }
            if (isArray(value)) {
                forEach(value, function(item) {
                    $this.remove(item);
                });
                return $this;
            }
            $this.data = dataRemove($this.data, isNumber(value) ? value : symbolToCodePoint(value));
            return $this;
        },
        'addRange': function(start, end) {
            var $this = this;
            $this.data = dataAddRange($this.data,
                isNumber(start) ? start : symbolToCodePoint(start),
                isNumber(end) ? end : symbolToCodePoint(end)
            );
            return $this;
        },
        'removeRange': function(start, end) {
            var $this = this;
            var startCodePoint = isNumber(start) ? start : symbolToCodePoint(start);
            var endCodePoint = isNumber(end) ? end : symbolToCodePoint(end);
            $this.data = dataRemoveRange(
                $this.data,
                startCodePoint,
                endCodePoint
            );
            return $this;
        },
        'intersection': function(argument) {
            var $this = this;
            var array = argument instanceof regenerate ?
                dataToArray(argument.data) :
                argument;
            $this.data = dataIntersection($this.data, array);
            return $this;
        },
        'contains': function(codePoint) {
            return dataContains(
                this.data,
                isNumber(codePoint) ? codePoint : symbolToCodePoint(codePoint)
            );
        },
        'clone': function() {
            var set = new regenerate;
            set.data = this.data.slice(0);
            return set;
        },
        'toString': function(options) {
            var result = createCharacterClassesFromData(
                this.data,
                options ? options.bmpOnly : false,
                options ? options.hasUnicodeFlag : false
            );
            if (!result) {
                return '[]';
            }
            return result.replace(regexNull, '\\0$1');
        },
        'toRegExp': function(flags) {
            var pattern = this.toString(
                flags && flags.indexOf('u') != -1 ?
                    { 'hasUnicodeFlag': true } :
                    null
            );
            return RegExp(pattern, flags || '');
        },
        'valueOf': function() {
            return dataToArray(this.data);
        }
    });

    proto.toArray = proto.valueOf;

    if (
        typeof define == 'function' &&
        typeof define.amd == 'object' &&
        define.amd
    ) {
        define(function() {
            return regenerate;
        });
    } else if (freeExports && !freeExports.nodeType) {
        if (freeModule) {
            freeModule.exports = regenerate;
        } else {
            freeExports.regenerate = regenerate;
        }
    } else {
        root.regenerate = regenerate;
    }

}(this));
