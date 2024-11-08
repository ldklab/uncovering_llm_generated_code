'use strict';

const maxInt = 2147483647;
const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-';
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
const errors = { 'overflow': 'Overflow: input needs wider integers to process', 'not-basic': 'Illegal input >= 0x80 (not a basic code point)', 'invalid-input': 'Invalid input' };
const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

function error(type) { throw new RangeError(errors[type]); }

function map(array, callback) {
	const result = [];
	let length = array.length;
	while (length--) { result[length] = callback(array[length]); }
	return result;
}

function mapDomain(domain, callback) {
	const parts = domain.split('@');
	let result = '';
	if (parts.length > 1) {
		result = parts[0] + '@';
		domain = parts[1];
	}
	domain = domain.replace(regexSeparators, '\x2E');
	const labels = domain.split('.');
	const encoded = map(labels, callback).join('.');
	return result + encoded;
}

function ucs2decode(string) {
	const output = [];
	let counter = 0, length = string.length;
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

const ucs2encode = codePoints => String.fromCodePoint(...codePoints);

const basicToDigit = function(codePoint) {
	if (codePoint >= 0x30 && codePoint < 0x3A) return 26 + (codePoint - 0x30);
	if (codePoint >= 0x41 && codePoint < 0x5B) return codePoint - 0x41;
	if (codePoint >= 0x61 && codePoint < 0x7B) return codePoint - 0x61;
	return base;
};

const digitToBasic = function(digit, flag) {
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

const adapt = function(delta, numPoints, firstTime) {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (; delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

const decode = function(input) {
	const output = [];
	const inputLength = input.length;
	let i = 0, n = initialN, bias = initialBias;

	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) basic = 0;

	for (let j = 0; j < basic; ++j) {
		if (input.charCodeAt(j) >= 0x80) error('not-basic');
		output.push(input.charCodeAt(j));
	}

	for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
		const oldi = i;
		for (let w = 1, k = base; ; k += base) {
			if (index >= inputLength) error('invalid-input');
			const digit = basicToDigit(input.charCodeAt(index++));
			if (digit >= base) error('invalid-input');
			if (digit > floor((maxInt - i) / w)) error('overflow');
			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
			if (digit < t) break;
			const baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) error('overflow');
			w *= baseMinusT;
		}

		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		if (floor(i / out) > maxInt - n) error('overflow');
		n += floor(i / out);
		i %= out;
		output.splice(i++, 0, n);
	}

	return String.fromCodePoint(...output);
};

const encode = function(input) {
	const output = [], inputLength = (input = ucs2decode(input)).length;
	let n = initialN, delta = 0, bias = initialBias;

	for (const currentValue of input) {
		if (currentValue < 0x80) output.push(stringFromCharCode(currentValue));
	}

	const basicLength = output.length;
	let handledCPCount = basicLength;

	if (basicLength) output.push(delimiter);

	while (handledCPCount < inputLength) {
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) m = currentValue;
		}

		const handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) error('overflow');

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) error('overflow');
			if (currentValue === n) {
				let q = delta;
				for (let k = base; ; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) break;
					output.push(stringFromCharCode(digitToBasic(t + q % (base - t), 0)));
					q = floor(q / (base - t));
				}
				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
				delta = 0;
				++handledCPCount;
			}
		}

		++delta;
		++n;
	}
	return output.join('');
};

const toUnicode = function(input) {
	return mapDomain(input, function(string) {
		return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
	});
};

const toASCII = function(input) {
	return mapDomain(input, function(string) {
		return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
	});
};

const punycode = {
	'version': '2.3.1',
	'ucs2': { 'decode': ucs2decode, 'encode': ucs2encode },
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

module.exports = punycode;
