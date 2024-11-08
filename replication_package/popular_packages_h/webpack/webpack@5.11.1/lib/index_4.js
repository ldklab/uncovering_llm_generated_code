"use strict";

const util = require("util");
const memorize = require("./util/memorize");

const lazyFunction = (factory) => {
	const cachedFactory = memorize(factory);
	return (...args) => cachedFactory()(...args);
};

const mergeExports = (obj, exports) => {
	const descriptors = Object.getOwnPropertyDescriptors(exports);
	for (const name in descriptors) {
		const { get, value } = descriptors[name];
		if (get) {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				get: memorize(get),
			});
		} else if (typeof value === "object") {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: mergeExports({}, value),
			});
		} else {
			throw new Error("Exposed values must be either a getter or a nested object");
		}
	}
	return Object.freeze(obj);
};

const fn = lazyFunction(() => require("./webpack"));
module.exports = mergeExports(fn, {
	get webpack() {
		return require("./webpack");
	},
	get validate() {
		const validateSchema = require("./validateSchema");
		const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
		return (options) => validateSchema(webpackOptionsSchema, options);
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
	// Other getters...
	util: {
		get createHash() {
			return require("./util/createHash");
		},
		get cleverMerge() {
			return require("./util/cleverMerge").cachedCleverMerge;
		},
	},
	get sources() {
		return require("webpack-sources");
	},
	experiments: {
		schemes: {
			get HttpUriPlugin() {
				return require("./schemes/HttpUriPlugin");
			},
		},
	},
	// More categories...
});
