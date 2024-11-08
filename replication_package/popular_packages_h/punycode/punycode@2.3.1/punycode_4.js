'use strict';

const maxInt = 2147483647;
const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128;
const delimiter = '-';

const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;

const errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

function error(type) {
	throw new RangeError(errors[type]);
}

function map(array, callback) {
	return array.map(callback);
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
	for (let i = 0; i < string.length; ) {
		const value = string.charCodeAt(i++);
		if (value >= 0xD800 && value <= 0xDBFF && i < string.length) {
			const extra = string.charCodeAt(i++);
			if ((extra & 0xFC00) === 0xDC00) {
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				output.push(value, extra);
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

const ucs2encode = codePoints => String.fromCodePoint(...codePoints);

const basicToDigit = codePoint => {
	if (codePoint - 48 < 10) return codePoint - 22;
	if (codePoint - 65 < 26) return codePoint - 65;
	if (codePoint - 97 < 26) return codePoint - 97;
	return base;
};

const digitToBasic = (digit, flag) => (
	digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5)
);

const adapt = (delta, numPoints, firstTime) => {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	while (delta > baseMinusTMin * tMax >> 1) {
		delta = floor(delta / baseMinusTMin);
		k += base;
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

const decode = input => {
	let output = [], i = 0, n = initialN, bias = initialBias;
	let basic = input.lastIndexOf(delimiter);
	basic = basic < 0 ? 0 : basic;

	for (let j = 0; j < basic; ++j) {
		if (input.charCodeAt(j) >= 0x80) error('not-basic');
		output.push(input.charCodeAt(j));
	}

	for (let index = basic > 0 ? basic + 1 : 0; index < input.length; ) {
		const oldi = i;
		for (let w = 1, k = base; ; k += base) {
			if (index >= input.length) error('invalid-input');
			const digit = basicToDigit(input.charCodeAt(index++));
			if (digit >= base) error('invalid-input');
			if (digit > floor((maxInt - i) / w)) error('overflow');
			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
			if (digit < t) break;
			w *= base - t;
		}
		bias = adapt(i - oldi, output.length + 1, oldi == 0);
		if (floor(i / (output.length + 1)) > maxInt - n) error('overflow');
		n += floor(i / (output.length + 1));
		i %= output.length + 1;
		output.splice(i++, 0, n);
	}
	return String.fromCodePoint(...output);
};

const encode = input => {
	const output = [];
	input = ucs2decode(input);
	let n = initialN, delta = 0, bias = initialBias;

	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(stringFromCharCode(currentValue));
		}
	}

	let handledCPCount = output.length;
	if (handledCPCount) output.push(delimiter);

	while (handledCPCount < input.length) {
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) m = currentValue;
		}

		delta += (m - n) * (handledCPCount + 1);
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) error('overflow');
			if (currentValue === n) {
				let q = delta;
				for (let k = base; ; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) break;
					const qMinusT = q - t;
					output.push(stringFromCharCode(digitToBasic(t + qMinusT % (base - t), 0)));
					q = floor(qMinusT / (base - t));
				}
				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCount + 1, handledCPCount === output.length);
				delta = 0;
				++handledCPCount;
			}
		}
		++delta;
		++n;
	}
	return output.join('');
};

const toUnicode = input => mapDomain(input, string =>
	regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string
);

const toASCII = input => mapDomain(input, string => 
	regexNonASCII.test(string) ? 'xn--' + encode(string) : string
);

const punycode = {
	'version': '2.3.1',
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode,
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode,
};

module.exports = punycode;
