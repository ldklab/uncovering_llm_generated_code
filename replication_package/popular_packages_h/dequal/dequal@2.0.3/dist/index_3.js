var hasOwnProperty = Object.prototype.hasOwnProperty;

function findKey(iterable, target) {
	for (let key of iterable.keys()) {
		if (dequal(key, target)) return key;
	}
}

function dequal(a, b) {
	if (a === b) return true;

	if (a && b && a.constructor === b.constructor) {
		switch (a.constructor) {
			case Date:
				return a.getTime() === b.getTime();
			case RegExp:
				return a.toString() === b.toString();
			case Array:
				if (a.length !== b.length) return false;
				for (let i = 0; i < a.length; i++) {
					if (!dequal(a[i], b[i])) return false;
				}
				return true;
			case Set:
				if (a.size !== b.size) return false;
				for (let val of a) {
					let found = (typeof val === 'object') ? findKey(b, val) : val;
					if (!b.has(found)) return false;
				}
				return true;
			case Map:
				if (a.size !== b.size) return false;
				for (let [key, value] of a) {
					let matchKey = (typeof key === 'object') ? findKey(b, key) : key;
					if (!dequal(value, b.get(matchKey))) return false;
				}
				return true;
			case ArrayBuffer:
				a = new Uint8Array(a);
				b = new Uint8Array(b);
				// falls through for ArrayBuffer equality
			default:
				if (ArrayBuffer.isView(a)) {
					if (a.byteLength !== b.byteLength) return false;
					for (let i = 0; i < a.byteLength; i++) {
						if (a[i] !== b[i]) return false;
					}
					return true;
				}
				if (typeof a === 'object') {
					let keysA = Object.keys(a);
					if (keysA.length !== Object.keys(b).length) return false;
					for (let key of keysA) {
						if (!hasOwnProperty.call(b, key) || !dequal(a[key], b[key])) return false;
					}
					return true;
				}
		}
	}

	return a !== a && b !== b;
}

module.exports = { dequal };
