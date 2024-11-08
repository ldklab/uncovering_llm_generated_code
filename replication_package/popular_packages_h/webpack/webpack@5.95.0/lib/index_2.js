"use strict";

const util = require("util");
const memoize = require("./util/memoize");

/**
 * Creates a memoized lazy function from a factory function.
 * @template {Function} T
 * @param {function(): T} factory The factory function to generate the original function.
 * @returns {T} The lazily loaded function.
 */
const lazyFunction = (factory) => {
	const fac = memoize(factory);
	return (...args) => fac()(...args);
};

/**
 * Merges two objects with lazy-loading properties.
 * @template A, B
 * @param {A} obj The target object that will receive properties.
 * @param {B} exports The source object containing properties to copy.
 * @returns {A & B} The merged object with properties from both inputs.
 */
const mergeExports = (obj, exports) => {
	const descriptors = Object.getOwnPropertyDescriptors(exports);

	Object.keys(descriptors).forEach((name) => {
		const descriptor = descriptors[name];

		if (descriptor.get) {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				get: memoize(descriptor.get),
			});
		} else if (typeof descriptor.value === "object") {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: mergeExports({}, descriptor.value),
			});
		} else {
			throw new Error("Exposed values must be either a getter or a nested object");
		}
	});

	return Object.freeze(obj);
};

// Lazy-load webpack and export its components with additional utilities.
module.exports = mergeExports(lazyFunction(() => require("./webpack")), {
	get webpack() {
		return require("./webpack");
	},
	get validate() {
		const webpackOptionsSchemaCheck = require("../schemas/WebpackOptions.check.js");

		const getRealValidate = memoize(() => {
			const validateSchema = require("./validateSchema");
			const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
			return (options) => validateSchema(webpackOptionsSchema, options);
		});

		return (options) => {
			if (!webpackOptionsSchemaCheck(options)) getRealValidate()(options);
		};
	},
	get validateSchema() {
		return require("./validateSchema");
	},
	get version() {
		return require("../package.json").version;
	},
	// Additional components and plugins are organized in specific categories
	cache: {
		get MemoryCachePlugin() {
			return require("./cache/MemoryCachePlugin");
		},
	},
	config: {
		get getNormalizedWebpackOptions() {
			return require("./config/normalization").getNormalizedWebpackOptions;
		},
		get applyWebpackOptionsDefaults() {
			return require("./config/defaults").applyWebpackOptionsDefaults;
		},
	},
	// Similarly, include additional plugins and components in organized categories
	// with deprecation notices and extensions into various webpack functionality areas.
});
