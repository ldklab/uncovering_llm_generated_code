'use strict';

const maxInt = 2147483647; 

const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128;
const delimiter = '-';

const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7E]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;

const errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

function throwError(type) {
	throw new RangeError(errors[type]);
}

function map(arr, fn) {
	return arr.map(fn);
}

function mapDomain(input, fn) {
	const parts = input.split('@');
	let result = '';
	if (parts.length > 1) {
		result = parts[0] + '@';
		input = parts[1];
	}
	input = input.replace(regexSeparators, '\x2E');
	const labels = input.split('.');
	return result + map(labels, fn).join('.');
}

function ucs2decode(string) {
	const output = [];
	let counter = 0;
	const length = string.length;
	while (counter < length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			const extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) {
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

const ucs2encode = array => String.fromCodePoint(...array);

function basicToDigit(codePoint) {
	if (codePoint - 0x30 < 0x0A) {
		return codePoint - 0x16;
	}
	if (codePoint - 0x41 < 0x1A) {
		return codePoint - 0x41;
	}
	if (codePoint - 0x61 < 0x1A) {
		return codePoint - 0x61;
	}
	return base;
}

function digitToBasic(digit, flag) {
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
}

function adapt(delta, numPoints, firstTime) {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	while (delta > baseMinusTMin * tMax >> 1) {
		delta = floor(delta / baseMinusTMin);
		k += base;
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
}

function decode(input) {
	const output = [];
	const inputLength = input.length;
	let i = 0;
	let n = initialN;
	let bias = initialBias;

	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) basic = 0;

	for (let j = 0; j < basic; ++j) {
		if (input.charCodeAt(j) >= 0x80) throwError('not-basic');
		output.push(input.charCodeAt(j));
	}

	for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
		let oldi = i;
		for (let w = 1, k = base; ; k += base) {
			if (index >= inputLength) throwError('invalid-input');
			const digit = basicToDigit(input.charCodeAt(index++));
			if (digit >= base || digit > floor((maxInt - i) / w)) throwError('overflow');
			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
			if (digit < t) break;
			const baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) throwError('overflow');
			w *= baseMinusT;
		}

		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);
		if (floor(i / out) > maxInt - n) throwError('overflow');
		n += floor(i / out);
		i %= out;
		output.splice(i++, 0, n);
	}

	return String.fromCodePoint(...output);
}

function encode(input) {
	const output = [];
	input = ucs2decode(input);
	let inputLength = input.length;

	let n = initialN;
	let delta = 0;
	let bias = initialBias;

	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(stringFromCharCode(currentValue));
		}
	}

	let basicLength = output.length;
	let handledCPCount = basicLength;

	if (basicLength) output.push(delimiter);

	while (handledCPCount < inputLength) {
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) m = currentValue;
		}

		const handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) throwError('overflow');
		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) throwError('overflow');
			if (currentValue == n) {
				let q = delta;
				for (let k = base; ; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) break;
					const qMinusT = q - t;
					const baseMinusT = base - t;
					output.push(
						stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
					);
					q = floor(qMinusT / baseMinusT);
				}

				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
				delta = 0;
				++handledCPCount;
			}
		}

		++delta;
		++n;
	}
	return output.join('');
}

function toUnicode(input) {
	return mapDomain(input, function(string) {
		return regexPunycode.test(string)
			? decode(string.slice(4).toLowerCase())
			: string;
	});
}

function toASCII(input) {
	return mapDomain(input, function(string) {
		return regexNonASCII.test(string)
			? 'xn--' + encode(string)
			: string;
	});
}

const punycode = {
	'version': '2.1.0',
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

module.exports = punycode;
