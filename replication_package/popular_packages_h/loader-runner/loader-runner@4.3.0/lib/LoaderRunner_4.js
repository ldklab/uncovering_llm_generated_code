const fs = require('fs');
const { readFile } = fs.promises;
const loadLoader = require('./loadLoader');

function utf8BufferToString(buf) {
	const str = buf.toString('utf-8');
	return str.charCodeAt(0) === 0xFEFF ? str.substr(1) : str;
}

const PATH_QUERY_FRAGMENT_REGEXP = /^((?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

function parsePathQueryFragment(str) {
	const match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
	return {
		path: match[1].replace(/\0(.)/g, '$1'),
		query: match[2] ? match[2].replace(/\0(.)/g, '$1') : '',
		fragment: match[3] || '',
	};
}

function dirname(path) {
	if (path === '/') return '/';
	const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
	const idx2 = Math.min(path.indexOf('/'), path.indexOf('\\'));
	if (idx < 0) return path;
	return idx === idx2 ? path.substr(0, idx + 1) : path.substr(0, idx);
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
		normalExecuted: false,
	};
	Object.defineProperty(obj, 'request', {
		enumerable: true,
		get() {
			return obj.path.replace(/#/g, '\0#') + obj.query.replace(/#/g, '\0#') + obj.fragment;
		},
		set(value) {
			if (typeof value === 'string') {
				const parsed = parsePathQueryFragment(value);
				obj.path = parsed.path;
				obj.query = parsed.query;
				obj.fragment = parsed.fragment;
				obj.options = undefined;
				obj.ident = undefined;
			} else {
				if (!value.loader) throw new Error(`request should be a string or object with loader and options (${JSON.stringify(value)})`);
				obj.path = value.loader;
				obj.fragment = value.fragment || '';
				obj.type = value.type;
				obj.options = value.options;
				obj.ident = value.ident;
				obj.query = obj.options === null || obj.options === undefined
					? ''
					: typeof obj.options === 'string'
					? `?${obj.options}`
					: obj.ident
					? `??${obj.ident}`
					: typeof obj.options === 'object' && obj.options.ident
					? `??${obj.options.ident}`
					: `?${JSON.stringify(obj.options)}`;
			}
		},
	});
	obj.request = loader;
	Object.preventExtensions?.(obj);
	return obj;
}

function runSyncOrAsync(fn, context, args, callback) {
	let isSync = true;
	let isDone = false;
	let isError = false;
	let reportedError = false;

	context.async = function async() {
		if (isDone) {
			if (reportedError) return;
			throw new Error('async(): The callback was already called.');
		}
		isSync = false;
		return innerCallback;
	};

	const innerCallback = (context.callback = function () {
		if (isDone) {
			if (reportedError) return;
			throw new Error('callback(): The callback was already called.');
		}
		isDone = true;
		isSync = false;
		try {
			callback.apply(null, arguments);
		} catch (e) {
			isError = true;
			throw e;
		}
	});

	try {
		const result = (function LOADER_EXECUTION() {
			return fn.apply(context, args);
		})();
		if (isSync) {
			isDone = true;
			if (result === undefined) return callback();
			if (result instanceof Promise) return result.then((r) => callback(null, r), callback);
			return callback(null, result);
		}
	} catch (e) {
		if (isError) throw e;
		if (isDone) {
			console.error(e.stack || e);
			return;
		}
		isDone = true;
		reportedError = true;
		callback(e);
	}
}

function convertArgs(args, raw) {
	if (!raw && Buffer.isBuffer(args[0])) args[0] = utf8BufferToString(args[0]);
	else if (raw && typeof args[0] === 'string') args[0] = Buffer.from(args[0], 'utf-8');
}

function iteratePitchingLoaders(options, loaderContext, callback) {
	if (loaderContext.loaderIndex >= loaderContext.loaders.length) return processResource(options, loaderContext, callback);

	const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];

	if (currentLoader.pitchExecuted) {
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(options, loaderContext, callback);
	}

	loadLoader(currentLoader, (err) => {
		if (err) {
			loaderContext.cacheable(false);
			return callback(err);
		}
		const fn = currentLoader.pitch;
		currentLoader.pitchExecuted = true;
		if (!fn) return iteratePitchingLoaders(options, loaderContext, callback);

		runSyncOrAsync(fn, loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, (currentLoader.data = {})], (err, ...args) => {
			if (err) return callback(err);
			if (args.some((value) => value !== undefined)) {
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

	const { resourcePath } = loaderContext;
	if (resourcePath) {
		options.processResource(loaderContext, resourcePath, (err, ...args) => {
			if (err) return callback(err);
			options.resourceBuffer = args[0];
			iterateNormalLoaders(options, loaderContext, args, callback);
		});
	} else {
		iterateNormalLoaders(options, loaderContext, [null], callback);
	}
}

function iterateNormalLoaders(options, loaderContext, args, callback) {
	if (loaderContext.loaderIndex < 0) return callback(null, args);

	const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];

	if (currentLoader.normalExecuted) {
		loaderContext.loaderIndex--;
		return iterateNormalLoaders(options, loaderContext, args, callback);
	}

	const fn = currentLoader.normal;
	currentLoader.normalExecuted = true;
	if (!fn) return iterateNormalLoaders(options, loaderContext, args, callback);

	convertArgs(args, currentLoader.raw);

	runSyncOrAsync(fn, loaderContext, args, (err, ...args) => {
		if (err) return callback(err);
		iterateNormalLoaders(options, loaderContext, args, callback);
	});
}

exports.getContext = function getContext(resource) {
	const { path } = parsePathQueryFragment(resource);
	return dirname(path);
};

exports.runLoaders = function runLoaders(options, callback) {
	const resource = options.resource || '';
	let loaders = options.loaders || [];
	const loaderContext = options.context || {};
	const processResource = options.processResource || (async (context, resource, cb) => {
		context.addDependency(resource);
		try {
			const data = await (options.readResource || readFile)(resource);
			cb(null, data);
		} catch (e) {
			cb(e);
		}
	}).bind(null);

	const splittedResource = resource ? parsePathQueryFragment(resource) : null;
	const resourcePath = splittedResource?.path;
	const resourceQuery = splittedResource?.query;
	const resourceFragment = splittedResource?.fragment;
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
		resourceQuery,
		resourceFragment,
		dependency: (loaderContext.addDependency = (file) => {
			fileDependencies.push(file);
		}),
		addContextDependency: (context) => {
			contextDependencies.push(context);
		},
		addMissingDependency: (context) => {
			missingDependencies.push(context);
		},
		getDependencies: () => fileDependencies.slice(),
		getContextDependencies: () => contextDependencies.slice(),
		getMissingDependencies: () => missingDependencies.slice(),
		clearDependencies: () => {
			fileDependencies.length = 0;
			contextDependencies.length = 0;
			missingDependencies.length = 0;
			requestCacheable = true;
		},
		cacheable(flag) {
			if (flag === false) requestCacheable = false;
		},
	});

	Object.defineProperties(loaderContext, {
		resource: {
			enumerable: true,
			get() {
				if (loaderContext.resourcePath === undefined) return undefined;
				return (
					loaderContext.resourcePath.replace(/#/g, '\0#') +
					loaderContext.resourceQuery.replace(/#/g, '\0#') +
					loaderContext.resourceFragment
				);
			},
			set(value) {
				const parsed = parsePathQueryFragment(value || '');
				loaderContext.resourcePath = parsed.path;
				loaderContext.resourceQuery = parsed.query;
				loaderContext.resourceFragment = parsed.fragment;
			},
		},
		request: {
			enumerable: true,
			get() {
				return loaderContext.loaders
					.map((o) => o.request)
					.concat(loaderContext.resource || '')
					.join('!');
			},
		},
		remainingRequest: {
			enumerable: true,
			get() {
				if (loaderContext.loaderIndex >= loaderContext.loaders.length - 1 && !loaderContext.resource)
					return '';
				return loaderContext.loaders
					.slice(loaderContext.loaderIndex + 1)
					.map((o) => o.request)
					.concat(loaderContext.resource || '')
					.join('!');
			},
		},
		currentRequest: {
			enumerable: true,
			get() {
				return loaderContext.loaders
					.slice(loaderContext.loaderIndex)
					.map((o) => o.request)
					.concat(loaderContext.resource || '')
					.join('!');
			},
		},
		previousRequest: {
			enumerable: true,
			get() {
				return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map((o) => o.request).join('!');
			},
		},
		query: {
			enumerable: true,
			get() {
				const entry = loaderContext.loaders[loaderContext.loaderIndex];
				return entry.options && typeof entry.options === 'object' ? entry.options : entry.query;
			},
		},
		data: {
			enumerable: true,
			get() {
				return loaderContext.loaders[loaderContext.loaderIndex].data;
			},
		},
	});

	Object.preventExtensions?.(loaderContext);

	const processOptions = {
		resourceBuffer: null,
		processResource,
	};
	iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
		if (err) {
			return callback(err, {
				cacheable: requestCacheable,
				fileDependencies,
				contextDependencies,
				missingDependencies,
			});
		}
		callback(null, {
			result,
			resourceBuffer: processOptions.resourceBuffer,
			cacheable: requestCacheable,
			fileDependencies,
			contextDependencies,
			missingDependencies,
		});
	});
};
