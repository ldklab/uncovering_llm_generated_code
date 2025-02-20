/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
const fs = require("fs");
const readFile = fs.readFile.bind(fs);
const loadLoader = require("./loadLoader");

function utf8BufferToString(buf) {
	const str = buf.toString("utf-8");
	return str.charCodeAt(0) === 0xFEFF ? str.substr(1) : str;
}

const PATH_QUERY_FRAGMENT_REGEXP = /^((?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

/**
 * Parses a path with query and fragment into its components.
 * @param {string} str Path with query and fragment.
 * @returns {{ path: string, query: string, fragment: string }} Parsed parts.
 */
function parsePathQueryFragment(str) {
	const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
	return {
		path: match[1].replace(/\0(.)/g, "$1"),
		query: match[2] ? match[2].replace(/\0(.)/g, "$1") : "",
		fragment: match[3] || ""
	};
}

function dirname(path) {
	if (path === "/") return "/";
	const idx = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
	const idx2 = Math.min(path.indexOf("/"), path.indexOf("\\"));
	return idx < 0 ? path : idx === idx2 ? path.substr(0, idx + 1) : path.substr(0, idx);
}

function createLoaderObject(loader) {
	const obj = {
		path: null,
		query: null,
		fragment: null,
		options: null,
		ident: null,
		normal: null,
		pitch: null,
		raw: null,
		data: null,
		pitchExecuted: false,
		normalExecuted: false
	};
	Object.defineProperty(obj, "request", {
		enumerable: true,
		get() {
			return obj.path.replace(/#/g, "\0#") + obj.query.replace(/#/g, "\0#") + obj.fragment;
		},
		set(value) {
			if (typeof value === "string") {
				const splittedRequest = parsePathQueryFragment(value);
				obj.path = splittedRequest.path;
				obj.query = splittedRequest.query;
				obj.fragment = splittedRequest.fragment;
				obj.options = undefined;
				obj.ident = undefined;
			} else {
				if (!value.loader) throw new Error(`request should be a string or object with loader and options (${JSON.stringify(value)})`);
				obj.path = value.loader;
				obj.fragment = value.fragment || "";
				obj.type = value.type;
				obj.options = value.options;
				obj.ident = value.ident;
				if (obj.options === null || obj.options === undefined) obj.query = "";
				else if (typeof obj.options === "string") obj.query = `?${obj.options}`;
				else if (obj.ident || typeof obj.options === "object" && obj.options.ident) obj.query = `??${obj.ident || obj.options.ident}`;
				else obj.query = `?${JSON.stringify(obj.options)}`;
			}
		}
	});
	obj.request = loader;
	if (Object.preventExtensions) Object.preventExtensions(obj);
	return obj;
}

function runSyncOrAsync(fn, context, args, callback) {
	let isSync = true;
	let isDone = false;
	context.async = function async() {
		if (isDone) throw new Error("async(): Callback was already called.");
		isSync = false;
		return innerCallback;
	};
	const innerCallback = context.callback = function () {
		if (isDone) throw new Error("callback(): Callback was already called.");
		isDone = true;
		isSync = false;
		try {
			callback.apply(null, arguments);
		} catch (e) {
			throw e;
		}
	};
	try {
		const result = (function LOADER_EXECUTION() {
			return fn.apply(context, args);
		}());
		if (isSync) {
			isDone = true;
			if (result === undefined) return callback();
			if (result && typeof result === "object" && typeof result.then === "function") {
				return result.then(r => callback(null, r), callback);
			}
			return callback(null, result);
		}
	} catch (e) {
		if (isDone) {
			console.error(e);
		} else {
			isDone = true;
			callback(e);
		}
	}
}

function convertArgs(args, raw) {
	args[0] = raw && typeof args[0] === "string" ? Buffer.from(args[0], "utf-8") : !raw && Buffer.isBuffer(args[0]) ? utf8BufferToString(args[0]) : args[0];
}

function iteratePitchingLoaders(options, loaderContext, callback) {
	if (loaderContext.loaderIndex >= loaderContext.loaders.length) return processResource(options, loaderContext, callback);

	const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
	if (currentLoaderObject.pitchExecuted) {
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(options, loaderContext, callback);
	}

	loadLoader(currentLoaderObject, function(err) {
		if (err) {
			loaderContext.cacheable(false);
			return callback(err);
		}
		const fn = currentLoaderObject.pitch;
		currentLoaderObject.pitchExecuted = true;
		if (!fn) return iteratePitchingLoaders(options, loaderContext, callback);

		runSyncOrAsync(
			fn,
			loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
			function(err) {
				if (err) return callback(err);
				const args = Array.from(arguments).slice(1);
				if (args.some(value => value !== undefined)) {
					loaderContext.loaderIndex--;
					iterateNormalLoaders(options, loaderContext, args, callback);
				} else {
					iteratePitchingLoaders(options, loaderContext, callback);
				}
			}
		);
	});
}

function processResource(options, loaderContext, callback) {
	loaderContext.loaderIndex = loaderContext.loaders.length - 1;

	const resourcePath = loaderContext.resourcePath;
	if (resourcePath) {
		options.processResource(loaderContext, resourcePath, function(err) {
			if (err) return callback(err);
			options.resourceBuffer = arguments[1];
			iterateNormalLoaders(options, loaderContext, Array.prototype.slice.call(arguments, 1), callback);
		});
	} else {
		iterateNormalLoaders(options, loaderContext, [null], callback);
	}
}

function iterateNormalLoaders(options, loaderContext, args, callback) {
	if (loaderContext.loaderIndex < 0) return callback(null, args);

	const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
	if (currentLoaderObject.normalExecuted) {
		loaderContext.loaderIndex--;
		return iterateNormalLoaders(options, loaderContext, args, callback);
	}

	const fn = currentLoaderObject.normal;
	currentLoaderObject.normalExecuted = true;
	if (!fn) return iterateNormalLoaders(options, loaderContext, args, callback);

	convertArgs(args, currentLoaderObject.raw);
	runSyncOrAsync(fn, loaderContext, args, function(err) {
		if (err) return callback(err);
		iterateNormalLoaders(options, loaderContext, Array.prototype.slice.call(arguments, 1), callback);
	});
}

exports.getContext = function getContext(resource) {
	const path = parsePathQueryFragment(resource).path;
	return dirname(path);
};

exports.runLoaders = function runLoaders(options, callback) {
	const resource = options.resource || "";
	let loaders = options.loaders || [];
	const loaderContext = options.context || {};
	const processResource = options.processResource || ((readResource, context, resource, callback) => {
		context.addDependency(resource);
		readResource(resource, callback);
	}).bind(null, options.readResource || readFile);

	const splittedResource = resource && parsePathQueryFragment(resource);
	const resourcePath = splittedResource ? splittedResource.path : undefined;
	const contextDirectory = resourcePath ? dirname(resourcePath) : null;

	let requestCacheable = true;
	const fileDependencies = [];
	const contextDependencies = [];
	const missingDependencies = [];
	loaders = loaders.map(createLoaderObject);

	Object.assign(loaderContext, {
		context: contextDirectory,
		loaderIndex: 0,
		loaders,
		resourcePath,
		resourceQuery: splittedResource ? splittedResource.query : undefined,
		resourceFragment: splittedResource ? splittedResource.fragment : undefined,
		async: null,
		cacheable(flag) {
			if (flag === false) requestCacheable = false;
		},
		dependency(file) {
			fileDependencies.push(file);
		},
		addDependency(file) {
			fileDependencies.push(file);
		},
		addContextDependency(context) {
			contextDependencies.push(context);
		},
		addMissingDependency(context) {
			missingDependencies.push(context);
		},
		getDependencies() {
			return fileDependencies.slice();
		},
		getContextDependencies() {
			return contextDependencies.slice();
		},
		getMissingDependencies() {
			return missingDependencies.slice();
		},
		clearDependencies() {
			fileDependencies.length = 0;
			contextDependencies.length = 0;
			missingDependencies.length = 0;
			requestCacheable = true;
		},
	});
	Object.defineProperty(loaderContext, "resource", {
		enumerable: true,
		get() {
			return loaderContext.resourcePath === undefined ? undefined : loaderContext.resourcePath.replace(/#/g, "\0#") + loaderContext.resourceQuery.replace(/#/g, "\0#") + loaderContext.resourceFragment;
		},
		set(value) {
			const splittedResource = value && parsePathQueryFragment(value);
			loaderContext.resourcePath = splittedResource ? splittedResource.path : undefined;
			loaderContext.resourceQuery = splittedResource ? splittedResource.query : undefined;
			loaderContext.resourceFragment = splittedResource ? splittedResource.fragment : undefined;
		}
	});
	Object.defineProperties(loaderContext, {
		request: {
			enumerable: true,
			get() {
				return loaderContext.loaders.map(o => o.request).concat(loaderContext.resource || "").join("!");
			}
		},
		remainingRequest: {
			enumerable: true,
			get() {
				if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource) return "";
				return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(o => o.request).concat(loaderContext.resource || "").join("!");
			}
		},
		currentRequest: {
			enumerable: true,
			get() {
				return loaderContext.loaders.slice(loaderContext.loaderIndex).map(o => o.request).concat(loaderContext.resource || "").join("!");
			}
		},
		previousRequest: {
			enumerable: true,
			get() {
				return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(o => o.request).join("!");
			}
		},
		query: {
			enumerable: true,
			get() {
				const entry = loaderContext.loaders[loaderContext.loaderIndex];
				return entry.options && typeof entry.options === "object" ? entry.options : entry.query;
			}
		},
		data: {
			enumerable: true,
			get() {
				return loaderContext.loaders[loaderContext.loaderIndex].data;
			}
		}
	});

	if (Object.preventExtensions) Object.preventExtensions(loaderContext);

	const processOptions = {
		resourceBuffer: null,
		processResource
	};
	iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
		if (err) {
			return callback(err, {
				cacheable: requestCacheable,
				fileDependencies: fileDependencies,
				contextDependencies: contextDependencies,
				missingDependencies: missingDependencies
			});
		}
		callback(null, {
			result,
			resourceBuffer: processOptions.resourceBuffer,
			cacheable: requestCacheable,
			fileDependencies: fileDependencies,
			contextDependencies: contextDependencies,
			missingDependencies: missingDependencies
		});
	});
};
