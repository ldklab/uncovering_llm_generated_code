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
const regexNonASCII = /[^\0-\x7F]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;

const errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

function error(type) {
	throw new RangeError(errors[type]);
}

function map(array, callback) {
	return array.map(callback);
}

function mapDomain(domain, callback) {
	const [local, domainPart] = domain.split('@');
	let result = local ? local + '@' : '';
	const processedDomain = domainPart.replace(regexSeparators, '\x2E');
	const encoded = map(processedDomain.split('.'), callback).join('.');
	return result + encoded;
}

function ucs2decode(string) {
	const output = [];
	for (let i = 0, len = string.length; i < len; i++) {
		const value = string.charCodeAt(i);
		if (value >= 0xD800 && value <= 0xDBFF && i < len - 1) {
			const extra = string.charCodeAt(++i);
			if ((extra & 0xFC00) === 0xDC00) {
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				output.push(value);
				i--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

const ucs2encode = codePoints => String.fromCodePoint(...codePoints);

const basicToDigit = (codePoint) => {
	if (codePoint >= 0x30 && codePoint < 0x3A) return 26 + (codePoint - 0x30);
	if (codePoint >= 0x41 && codePoint < 0x5B) return codePoint - 0x41;
	if (codePoint >= 0x61 && codePoint < 0x7B) return codePoint - 0x61;
	return base;
};

const digitToBasic = (digit, flag) => digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);

const adapt = (delta, numPoints, firstTime) => {
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	let k = 0;
	while (delta > base - tMin * tMax >> 1) {
		delta = floor(delta / (base - tMin));
		k += base;
	}
	return floor(k + (base - tMin + 1) * delta / (delta + skew));
};

const decode = (input) => {
	const output = [];
	let i = 0, n = initialN, bias = initialBias;
	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) basic = 0;
	for (let j = 0; j < basic; ++j) {
		if (input.charCodeAt(j) >= 0x80) error('not-basic');
		output.push(input.charCodeAt(j));
	}
	for (let index = basic > 0 ? basic + 1 : 0; index < input.length;) {
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
		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);
		if (floor(i / out) > maxInt - n) error('overflow');
		n += floor(i / out);
		i %= out;
		output.splice(i++, 0, n);
	}
	return String.fromCodePoint(...output);
};

const encode = (input) => {
	const output = [];
	input = ucs2decode(input);
	const inputLength = input.length;
	let n = initialN, delta = 0, bias = initialBias;
	input.forEach(value => { if (value < 0x80) output.push(stringFromCharCode(value)); });
	let basicLength = output.length, handledCPCount = basicLength;
	if (basicLength) output.push(delimiter);
	while (handledCPCount < inputLength) {
		let m = maxInt;
		input.forEach(value => { if (value >= n && value < m) m = value; });
		if (m - n > floor((maxInt - delta) / (handledCPCount + 1))) error('overflow');
		delta += (m - n) * (handledCPCount + 1);
		n = m;
		input.forEach(value => {
			if (value < n && ++delta > maxInt) error('overflow');
			if (value === n) {
				let q = delta;
				for (let k = base; ; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) break;
					output.push(stringFromCharCode(digitToBasic(t + q % (base - t), 0)));
					q = floor(q / (base - t));
				}
				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCount + 1, handledCPCount === basicLength);
				delta = 0;
				handledCPCount++;
			}
		});
		delta++;
		n++;
	}
	return output.join('');
};

const toUnicode = (input) => mapDomain(input, (string) => regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string);

const toASCII = (input) => mapDomain(input, (string) => regexNonASCII.test(string) ? 'xn--' + encode(string) : string);

const punycode = {
	version: '2.3.1',
	ucs2: { decode: ucs2decode, encode: ucs2encode },
	decode,
	encode,
	toASCII,
	toUnicode,
};

module.exports = punycode;
