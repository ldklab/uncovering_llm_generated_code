/*! https://mths.be/regenerate v1.4.2 by @mathias | MIT license */
(function(root) {
	const ERROR_MESSAGES = {
		rangeOrder: 'A range’s `stop` value must be greater than or equal to the `start` value.',
		codePointRange: 'Invalid code point value. Code points range from U+000000 to U+10FFFF.'
	};

	const HIGH_SURROGATE_MIN = 0xD800, HIGH_SURROGATE_MAX = 0xDBFF, LOW_SURROGATE_MIN = 0xDC00, LOW_SURROGATE_MAX = 0xDFFF;
	const regexNull = /\\x00([^0123456789]|$)/g;
	const zeroes = '0000';
	
	const extend = (dest, src) => Object.assign(dest, src);
	const forEach = (arr, cb) => arr.forEach(cb);
	const isArray = Array.isArray;
	const isNumber = val => typeof val === 'number' || Object.prototype.toString.call(val) === '[object Number]';

	const pad = (num, len) => String(num).padStart(len, '0');
	const hex = num => num.toString(16).toUpperCase();
	
	// -- Core Data Manipulation Functions --

	const dataFromCodePoints = codePoints => {
		let result = [], isStart = true, previous = 0;
		codePoints.forEach((tmp, index) => {
			if (isStart) {
				result.push(tmp);
				previous = tmp;
				isStart = false;
			} else if (tmp === previous + 1) {
				if (index !== codePoints.length - 1) {
					previous = tmp;
				} else {
					isStart = true;
					result.push(tmp + 1);
				}
			} else {
				result.push(previous + 1, tmp);
				previous = tmp;
			}
		});
		if (!isStart) result.push(codePoints[codePoints.length - 1] + 1);
		return result;
	};

	const dataAdd = (data, codePoint) => {
		if (codePoint < 0 || codePoint > 0x10FFFF) throw RangeError(ERROR_MESSAGES.codePointRange);
		let index = 0, lastIndex = null;
		while (index < data.length) {
			const [start, end] = [data[index], data[index + 1]];
			if (codePoint >= start && codePoint < end) return data;
			if (start > codePoint) {
				data.splice(lastIndex !== null ? lastIndex + 2 : 0, 0, codePoint, codePoint + 1);
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
			lastIndex = index;
			index += 2;
		}
		data.push(codePoint, codePoint + 1);
		return data;
	};
	
	const dataRemove = (data, codePoint) => {
		let index = 0;
		while (index < data.length) {
			const [start, end] = [data[index], data[index + 1]];
			if (codePoint >= start && codePoint < end) {
				if (codePoint === start) {
					if (end === start + 1) {
						data.splice(index, 2);
					} else {
						data[index] = codePoint + 1;
					}
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

	const dataAddRange = (data, start, end) => {
		if (end < start) throw Error(ERROR_MESSAGES.rangeOrder);
		if (start < 0 || start > 0x10FFFF || end < 0 || end > 0x10FFFF) throw RangeError(ERROR_MESSAGES.codePointRange);
		let index = 0;
		while (index < data.length) {
			const [rangeStart, rangeEnd] = [data[index], data[index + 1]];
			if (rangeStart > end) {
				data.splice(index, 0, start, end + 1);
				return data;
			}
			if (start >= rangeStart && start < rangeEnd) {
				data[index + 1] = Math.max(rangeEnd, end + 1);
				return data;
			}
			if (start <= rangeStart && end + 1 >= rangeEnd) {
				data[index] = start;
				data[index + 1] = end + 1;
			}
			index += 2;
		}
		data.push(start, end + 1);
		return data;
	};

	const dataRemoveRange = (data, start, end) => {
		if (end < start) throw Error(ERROR_MESSAGES.rangeOrder);
		let index = 0;
		while (index < data.length) {
			const [rangeStart, rangeEnd] = [data[index], data[index + 1] - 1];
			if (rangeStart > end) return data;
			if (start <= rangeStart && end >= rangeEnd) {
				data.splice(index, 2);
				continue;
			}
			if (start >= rangeStart && end < rangeEnd) {
				if (start === rangeStart) {
					data[index] = end + 1;
					return data;
				}
				data.splice(index, 2, rangeStart, start, end + 1, rangeEnd + 1);
				return data;
			}
			if (start >= rangeStart && start <= rangeEnd) {
				data[index + 1] = start;
			} else if (end >= rangeStart && end <= rangeEnd) {
				data[index] = end + 1;
				return data;
			}
			index += 2;
		}
		return data;
	};

	const dataContains = (data, codePoint) => {
		let index = 0;
		while (index < data.length) {
			const [start, end] = [data[index], data[index + 1]];
			if (codePoint >= start && codePoint < end) return true;
			index += 2;
		}
		return false;
	};

	const dataIntersection = (data, codePoints) => {
		const intersection = codePoints.filter(codePoint => dataContains(data, codePoint));
		return dataFromCodePoints(intersection);
	};

	const dataToArray = data => {
		let result = [];
		for (let index = 0; index < data.length; index += 2) {
			for (let i = data[index]; i < data[index + 1]; i++) {
				result.push(i);
			}
		}
		return result;
	};

	const highSurrogate = codePoint => Math.floor((codePoint - 0x10000) / 0x400) + HIGH_SURROGATE_MIN;
	const lowSurrogate = codePoint => (codePoint - 0x10000) % 0x400 + LOW_SURROGATE_MIN;

	const codePointToString = codePoint => {
		if (codePoint > 0xFFFF) throw Error('Only BMP code points are converted here.');
		if (codePoint >= 0x20 && codePoint <= 0x7E) return String.fromCharCode(codePoint);
		const escapes = {
			0x09: '\\t', 0x0A: '\\n', 0x0C: '\\f', 0x0D: '\\r', 0x5C: '\\\\',
			0x2D: '\\x2D', 0x24: '\\$', 0x28: '\\(', 0x29: '\\)', 0x2A: '\\*',
			0x2B: '\\+', 0x2E: '\\.', 0x2F: '\\/', 0x3F: '\\?', 0x5B: '\\[',
			0x5D: '\\]', 0x5E: '\\^', 0x7B: '\\{', 0x7D: '\\}'
		};
		if (escapes[codePoint]) return escapes[codePoint];
		if (codePoint < 0x10) return '\\x0' + codePoint.toString(16);
		if (codePoint < 0x100) return '\\x' + pad(codePoint.toString(16).toUpperCase(), 2);
		return '\\u' + pad(codePoint.toString(16).toUpperCase(), 4);
	};

	const codePointToStringUnicode = codePoint => codePoint <= 0xFFFF 
		? codePointToString(codePoint) 
		: '\\u{' + codePoint.toString(16).toUpperCase() + '}';

	// -- Main Regenerate class --

	function Regenerate(value) {
		if (!(this instanceof Regenerate)) return new Regenerate(value);
		this.data = [];
		if (value != null) this.add(value);
	}

	Regenerate.prototype = {
		version: '1.4.2',
		add(value) {
			if (value == null) return this;
			if (value instanceof Regenerate) {
				this.data = dataAddData(this.data, value.data);
			} else if (arguments.length > 1 || isArray(value)) {
				forEach(arguments.length > 1 ? Array.from(arguments) : value, item => this.add(item));
			} else {
				this.data = dataAdd(this.data, isNumber(value) ? value : symbolToCodePoint(value));
			}
			return this;
		},
		remove(value) {
			if (value == null) return this;
			if (value instanceof Regenerate) {
				this.data = dataRemoveData(this.data, value.data);
			} else if (arguments.length > 1 || isArray(value)) {
				forEach(arguments.length > 1 ? Array.from(arguments) : value, item => this.remove(item));
			} else {
				this.data = dataRemove(this.data, isNumber(value) ? value : symbolToCodePoint(value));
			}
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
			const array = argument instanceof Regenerate ? dataToArray(argument.data) : argument;
			this.data = dataIntersection(this.data, array);
			return this;
		},
		contains(codePoint) {
			return dataContains(this.data, isNumber(codePoint) ? codePoint : symbolToCodePoint(codePoint));
		},
		clone() {
			const set = new Regenerate();
			set.data = this.data.slice(0);
			return set;
		},
		toString(options = {}) {
			let result = createCharacterClassesFromData(this.data, options.bmpOnly || false, options.hasUnicodeFlag || false);
			if (!result) return '[]';
			return result.replace(regexNull, '\\0$1');
		},
		toRegExp(flags = '') {
			const pattern = this.toString(flags.includes('u') ? { hasUnicodeFlag: true } : {});
			return new RegExp(pattern, flags);
		},
		valueOf() {
			return dataToArray(this.data);
		}
	};

	Regenerate.prototype.toArray = Regenerate.prototype.valueOf;

	if (typeof define === 'function' && define.amd) {
		define(() => Regenerate);
	} else if (typeof exports === 'object' && exports) {
		if (typeof module === 'object' && module && module.exports === exports) {
			module.exports = Regenerate;
		} else {
			exports.regenerate = Regenerate;
		}
	} else {
		root.regenerate = Regenerate;
	}
}(this));
