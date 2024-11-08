'use strict';

const maxInt = 2147483647;
const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
const initialBias = 72, initialN = 128, delimiter = '-';
const regexPunycode = /^xn--/, regexNonASCII = /[^\0-\x7E]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;

const errors = {
	overflow: 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

function error(type) {
	throw new RangeError(errors[type]);
}

function map(array, fn) {
	return array.map(fn);
}

function mapDomain(string, fn) {
	let [local, domain] = string.split('@');
	if (domain) {
		return `${local}@${mapDomain(domain, fn)}`;
	}
	return string.replace(regexSeparators, '\x2E').split('.').map(fn).join('.');
}

function ucs2decode(string) {
	const output = [];
	for (let counter = 0, length = string.length; counter < length; ) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			const extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) === 0xDC00) {
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
	delta = firstTime ? Math.floor(delta / damp) : delta >> 1;
	delta += Math.floor(delta / numPoints);
	while (delta > baseMinusTMin * tMax >> 1) {
		delta = Math.floor(delta / baseMinusTMin);
		k += base;
	}
	return Math.floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
}

function decode(input) {
	const output = [];
	let i = 0, n = initialN, bias = initialBias;
	let basic = input.lastIndexOf(delimiter);
	basic = basic < 0 ? 0 : basic;

	for (let j = 0; j < basic; ++j) {
		if (input.charCodeAt(j) >= 0x80) {
			error('not-basic');
		}
		output.push(input.charCodeAt(j));
	}
	for (let index = basic > 0 ? basic + 1 : 0, inputLength = input.length; index < inputLength; ) {
		let oldi = i, w = 1;
		for (let k = base; ; k += base) {
			if (index >= inputLength) error('invalid-input');
			const digit = basicToDigit(input.charCodeAt(index++));
			if (digit >= base || digit > Math.floor((maxInt - i) / w)) error('overflow');
			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
			if (digit < t) break;
			w *= (base - t);
		}
		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi === 0);
		if (Math.floor(i / out) > maxInt - n) error('overflow');
		n += Math.floor(i / out);
		i %= out;
		output.splice(i++, 0, n);
	}
	return String.fromCodePoint(...output);
}

function encode(input) {
	const output = [];
	input = ucs2decode(input);
	const inputLength = input.length;
	let n = initialN, delta = 0, bias = initialBias;

	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(String.fromCharCode(currentValue));
		}
	}

	let handledCPCount = output.length, basicLength = handledCPCount;
	if (basicLength) output.push(delimiter);

	while (handledCPCount < inputLength) {
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) {
				m = currentValue;
			}
		}

		if (m - n > Math.floor((maxInt - delta) / (handledCPCount + 1))) {
			error('overflow');
		}

		delta += (m - n) * (handledCPCount + 1);
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) {
				error('overflow');
			}
			if (currentValue === n) {
				let q = delta;
				for (let k = base; ; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) break;
					const qMinusT = q - t, baseMinusT = base - t;
					output.push(String.fromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
					q = Math.floor(qMinusT / baseMinusT);
				}
				output.push(String.fromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCount + 1, handledCPCount === basicLength);
				delta = 0;
				++handledCPCount;
			}
		}
		++delta; ++n;
	}
	return output.join('');
}

const toUnicode = input => mapDomain(input, string => regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string);

const toASCII = input => mapDomain(input, string => regexNonASCII.test(string) ? 'xn--' + encode(string) : string);

const punycode = {
	version: '2.1.0',
	ucs2: { decode: ucs2decode, encode: ucs2encode },
	decode, encode, toASCII, toUnicode
};

module.exports = punycode;
