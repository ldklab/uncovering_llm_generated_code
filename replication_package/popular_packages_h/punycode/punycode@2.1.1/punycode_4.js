'use strict';

const maxInt = 2147483647;
const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128;
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

function error(type) {
	throw new RangeError(errors[type]);
}

function map(array, fn) {
	const result = new Array(array.length);
	for (let i = 0; i < array.length; i++) {
		result[i] = fn(array[i]);
	}
	return result;
}

function mapDomain(string, fn) {
	const parts = string.split('@');
	let result = '';
	if (parts.length > 1) {
		result = parts[0] + '@';
		string = parts[1];
	}
	string = string.replace(regexSeparators, '\x2E');
	const labels = string.split('.');
	const encoded = map(labels, fn).join('.');
	return result + encoded;
}

function ucs2decode(string) {
	const output = [];
	let counter = 0;
	while (counter < string.length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < string.length) {
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

const basicToDigit = codePoint => {
	if (codePoint - 0x30 < 0x0A) return codePoint - 0x16;
	if (codePoint - 0x41 < 0x1A) return codePoint - 0x41;
	if (codePoint - 0x61 < 0x1A) return codePoint - 0x61;
	return base;
};

const digitToBasic = (digit, flag) => digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);

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
	const output = [];
	let i = 0, n = initialN, bias = initialBias;
	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) basic = 0;

	for (let j = 0; j < basic; ++j) {
		if (input.charCodeAt(j) >= 0x80) error('not-basic');
		output.push(input.charCodeAt(j));
	}

	for (let index = basic > 0 ? basic + 1 : 0; index < input.length;) {
		let oldi = i;
		for (let w = 1, k = base; ; k += base) {
			if (index >= input.length) error('invalid-input');

			const digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base || digit > floor((maxInt - i) / w)) error('overflow');

			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

			if (digit < t) break;

			w *= base - t;
		}

		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi === 0);

		if (floor(i / out) > maxInt - n) error('overflow');

		n += floor(i / out);
		i %= out;

		output.splice(i++, 0, n);
	}

	return String.fromCodePoint(...output);
};

const encode = input => {
	const output = [];
	input = ucs2decode(input);
	let inputLength = input.length;
	let n = initialN, delta = 0, bias = initialBias;

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
					const qMinusT = q - t;
					output.push(stringFromCharCode(digitToBasic(t + qMinusT % (base - t), 0)));
					q = floor(qMinusT / (base - t));
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

const toUnicode = input => mapDomain(input, string => 
	regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string
);

const toASCII = input => mapDomain(input, string => 
	regexNonASCII.test(string) ? 'xn--' + encode(string) : string
);

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
