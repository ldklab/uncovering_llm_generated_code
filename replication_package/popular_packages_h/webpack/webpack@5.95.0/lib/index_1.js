"use strict";

const util = require("util");
const memoize = require("./util/memoize");

const lazyFunction = factory => {
	const fac = memoize(factory);
	const f = (...args) => fac()(...args);
	return f;
};

const mergeExports = (obj, exports) => {
	const descriptors = Object.getOwnPropertyDescriptors(exports);
	for (const name of Object.keys(descriptors)) {
		const descriptor = descriptors[name];
		if (descriptor.get) {
			const fn = descriptor.get;
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				get: memoize(fn)
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

const webpackLazyLoad = lazyFunction(() => require("./webpack"));
module.exports = mergeExports(webpackLazyLoad, {
	get webpack() {
		return require("./webpack");
	},
	get validate() {
		const webpackOptionsSchemaCheck = require("../schemas/WebpackOptions.check.js");
		const getRealValidate = memoize(() => {
			const validateSchema = require("./validateSchema");
			const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
			return options => validateSchema(webpackOptionsSchema, options);
		});
		return options => {
			if (!webpackOptionsSchemaCheck(options)) getRealValidate()(options);
		};
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
	// ... (similar pattern for other plugins)
	get BannerPlugin() {
		return require("./BannerPlugin");
	},

	util: {
		get createHash() {
			return require("./util/createHash");
		},
		// ... (similar pattern for other utilities)
		get cleverMerge() {
			return require("./util/cleverMerge").cachedCleverMerge;
		}
	},

	get sources() {
		return require("webpack-sources");
	},

	// Other categorized plugins and utilities
	// ...
});
