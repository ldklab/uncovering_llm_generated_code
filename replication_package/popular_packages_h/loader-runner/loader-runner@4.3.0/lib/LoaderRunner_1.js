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
	const [i, j] = [path.lastIndexOf("/"), path.lastIndexOf("\\")];
	const [i2, j2] = [path.indexOf("/"), path.indexOf("\\")];
	const idx = Math.max(i, j);
	const idx2 = Math.max(i2, j2);
	return idx < 0 ? path : path.substr(0, idx === idx2 ? idx + 1 : idx);
}

function createLoaderObject(loader) {
	const obj = {
		path: null, query: null, fragment: null, options: null,
		ident: null, normal: null, pitch: null, raw: null, data: null,
		pitchExecuted: false, normalExecuted: false
	};
	Object.defineProperty(obj, "request", {
		enumerable: true,
		get() {
			return `${obj.path.replace(/#/g, "\0#")}${obj.query.replace(/#/g, "\0#")}${obj.fragment}`;
		},
		set(value) {
			if (typeof value === "string") {
				const parsed = parsePathQueryFragment(value);
				Object.assign(obj, { path: parsed.path, query: parsed.query, fragment: parsed.fragment });
			} else {
				if (!value.loader) throw new Error(`request should be a string or object with loader and options (${JSON.stringify(value)})`);
				Object.assign(obj, {
					path: value.loader,
					query: value.options === null ? "" :
						value.options === undefined ? "" :
						typeof value.options === "string" ? `?${value.options}` :
						value.ident ? `??${value.ident}` :
						typeof value.options === "object" && value.options.ident ? `??${value.options.ident}` :
						`?${JSON.stringify(value.options)}`,
					fragment: value.fragment || "",
					options: value.options,
					ident: value.ident
				});
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
	let reportedError = false;
	context.async = function async() {
		if (isDone && !reportedError) throw new Error("async(): The callback was already called.");
		isSync = false;
		return innerCallback;
	};
	const innerCallback = context.callback = function() {
		if (isDone && !reportedError) throw new Error("callback(): The callback was already called.");
		isDone = true;
		isSync = false;
		try {
			callback.apply(null, arguments);
		} catch (e) {
			throw e;
		}
	};
	try {
		const result = (function LOADER_EXECUTION() { return fn.apply(context, args); }());
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
			if (typeof e === "object" && e.stack) console.error(e.stack); 
			else console.error(e);
			return;
		}
		isDone = true;
		reportedError = true;
		callback(e);
	}
}

function convertArgs(args, raw) {
	if (!raw && Buffer.isBuffer(args[0])) args[0] = utf8BufferToString(args[0]);
	else if (raw && typeof args[0] === "string") args[0] = Buffer.from(args[0], "utf-8");
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

		runSyncOrAsync(fn, loaderContext, [
			loaderContext.remainingRequest,
			loaderContext.previousRequest,
			currentLoaderObject.data = {}
		], function(err) {
			if (err) return callback(err);
			const args = Array.prototype.slice.call(arguments, 1);
			const hasArg = args.some(value => value !== undefined);
			if (hasArg) {
				loaderContext.loaderIndex--;
				iterateNormalLoaders(options, loaderContext, args, callback);
			} else {
				iteratePitchingLoaders(options, loaderContext, callback);
			}
		});
	});
}

function processResource(options, loaderContext, callback) {
	loaderContext.loaderIndex = loaderContext.loaders.length - 1;

	const resourcePath = loaderContext.resourcePath;
	if (resourcePath) {
		options.processResource(loaderContext, resourcePath, function(err) {
			if (err) return callback(err);
			const args = Array.prototype.slice.call(arguments, 1);
			options.resourceBuffer = args[0];
			iterateNormalLoaders(options, loaderContext, args, callback);
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

		const args = Array.prototype.slice.call(arguments, 1);
		iterateNormalLoaders(options, loaderContext, args, callback);
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
	const contextDirectory = splittedResource ? dirname(splittedResource.path) : null;

	let requestCacheable = true;
	const fileDependencies = [];
	const contextDependencies = [];
	const missingDependencies = [];

	loaders = loaders.map(createLoaderObject);

	Object.assign(loaderContext, {
		context: contextDirectory,
		loaderIndex: 0,
		loaders,
		resourcePath: splittedResource ? splittedResource.path : undefined,
		resourceQuery: splittedResource ? splittedResource.query : undefined,
		resourceFragment: splittedResource ? splittedResource.fragment : undefined,
		async: null,
		callback: null,
		cacheable(flag) {
			if (flag === false) requestCacheable = false;
		},
		dependency: function addDependency(file) {
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
		}
	});

	Object.defineProperty(loaderContext, "resource", {
		enumerable: true,
		get() {
			if (loaderContext.resourcePath === undefined) return undefined;
			return `${loaderContext.resourcePath.replace(/#/g, "\0#")}${loaderContext.resourceQuery.replace(/#/g, "\0#")}${loaderContext.resourceFragment}`;
		},
		set(value) {
			const splitted = value && parsePathQueryFragment(value);
			loaderContext.resourcePath = splitted ? splitted.path : undefined;
			loaderContext.resourceQuery = splitted ? splitted.query : undefined;
			loaderContext.resourceFragment = splitted ? splitted.fragment : undefined;
		}
	});

	Object.defineProperty(loaderContext, "request", {
		enumerable: true,
		get() {
			return loaderContext.loaders.map(o => o.request).concat(loaderContext.resource || "").join("!");
		}
	});

	Object.defineProperty(loaderContext, "remainingRequest", {
		enumerable: true,
		get() {
			if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource) return "";
			return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(o => o.request).concat(loaderContext.resource || "").join("!");
		}
	});

	Object.defineProperty(loaderContext, "currentRequest", {
		enumerable: true,
		get() {
			return loaderContext.loaders.slice(loaderContext.loaderIndex).map(o => o.request).concat(loaderContext.resource || "").join("!");
		}
	});

	Object.defineProperty(loaderContext, "previousRequest", {
		enumerable: true,
		get() {
			return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(o => o.request).join("!");
		}
	});

	Object.defineProperty(loaderContext, "query", {
		enumerable: true,
		get() {
			const entry = loaderContext.loaders[loaderContext.loaderIndex];
			return entry.options && typeof entry.options === "object" ? entry.options : entry.query;
		}
	});

	Object.defineProperty(loaderContext, "data", {
		enumerable: true,
		get() {
			return loaderContext.loaders[loaderContext.loaderIndex].data;
		}
	});

	if (Object.preventExtensions) Object.preventExtensions(loaderContext);

	const processOptions = { resourceBuffer: null, processResource };
	iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
		if (err) {
			return callback(err, {
				cacheable: requestCacheable,
				fileDependencies,
				contextDependencies,
				missingDependencies
			});
		}
		callback(null, {
			result,
			resourceBuffer: processOptions.resourceBuffer,
			cacheable: requestCacheable,
			fileDependencies,
			contextDependencies,
			missingDependencies
		});
	});
};
