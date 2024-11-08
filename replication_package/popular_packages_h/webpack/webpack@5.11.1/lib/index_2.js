"use strict";

const util = require("util");
const memorize = require("./util/memorize");

/**
 * Lazily load a function returned by a factory function
 * @template {Function} T
 * @param {function(): T} factory Factory function that returns the actual function
 * @returns {T} Lazily loaded function
 */
const lazyFunction = factory => {
	const fac = memorize(factory);
	const f = (...args) => fac()(...args);
	return f;
};

/**
 * Merge properties from exports to obj with memoized getters
 * @template A, B
 * @param {A} obj Destination object
 * @param {B} exports Object containing export properties
 * @returns {A & B} Merged object with properties and derived properties
 */
const mergeExports = (obj, exports) => {
	const descriptors = Object.getOwnPropertyDescriptors(exports);

	for (const name of Object.keys(descriptors)) {
		const descriptor = descriptors[name];
		if (descriptor.get) {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				get: memorize(descriptor.get)
			});
		} else if (typeof descriptor.value === "object") {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: mergeExports({}, descriptor.value)
			});
		} else {
			throw new Error("Exposed values must be either a getter or a nested object");
		}
	}

	return Object.freeze(obj);
};

// Export the main webpack function and other APIs
const fn = lazyFunction(() => require("./webpack"));

module.exports = mergeExports(fn, {
	get webpack() {
		return require("./webpack");
	},
	get validate() {
		const validateSchema = require("./validateSchema");
		const schema = require("../schemas/WebpackOptions.json");
		return options => validateSchema(schema, options);
	},
	get validateSchema() {
		return require("./validateSchema");
	},
	get version() {
		return require("../package.json").version;
	},
	get cli() {
		return require("./cli");
	},
	get AutomaticPrefetchPlugin() {
		return require("./AutomaticPrefetchPlugin");
	},
	// ... (rest of the modules)
	// Optimization plugins example
	optimize: {
		get AggressiveMergingPlugin() {
			return require("./optimize/AggressiveMergingPlugin");
		},
		get LimitChunkCountPlugin() {
			return require("./optimize/LimitChunkCountPlugin");
		},
		get SplitChunksPlugin() {
			return require("./optimize/SplitChunksPlugin");
		}
	},
	// Utility functions
	util: {
		get createHash() {
			return require("./util/createHash");
		},
		get comparators() {
			return require("./util/comparators");
		},
		get cleverMerge() {
			return require("./util/cleverMerge").cachedCleverMerge;
		}
	},
	// ... (additional structural categories like ids, javascript, node, etc.)
});
