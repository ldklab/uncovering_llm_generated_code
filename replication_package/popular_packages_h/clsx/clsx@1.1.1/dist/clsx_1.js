function toVal(mix) {
	let str = '';

	if (typeof mix === 'string' || typeof mix === 'number') {
		str += mix;
	} else if (typeof mix === 'object') {
		if (Array.isArray(mix)) {
			for (let k = 0; k < mix.length; k++) {
				if (mix[k]) {
					const y = toVal(mix[k]);
					if (y) {
						if (str) str += ' ';
						str += y;
					}
				}
			}
		} else {
			for (let k in mix) {
				if (mix[k]) {
					if (str) str += ' ';
					str += k;
				}
			}
		}
	}

	return str;
}

module.exports = function (...args) {
	let str = '';
	for (let i = 0; i < args.length; i++) {
		const tmp = args[i];
		if (tmp) {
			const x = toVal(tmp);
			if (x) {
				if (str) str += ' ';
				str += x;
			}
		}
	}
	return str;
}
