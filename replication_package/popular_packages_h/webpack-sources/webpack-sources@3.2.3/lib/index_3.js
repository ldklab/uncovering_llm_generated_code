/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const lazyExport = (name, loadModule) => {
	let cachedValue;
	Object.defineProperty(exports, name, {
		get: () => {
			if (loadModule !== undefined) {
				cachedValue = loadModule();
				loadModule = undefined;
			}
			return cachedValue;
		},
		configurable: true
	});
};

lazyExport("Source", () => require("./Source"));
lazyExport("RawSource", () => require("./RawSource"));
lazyExport("OriginalSource", () => require("./OriginalSource"));
lazyExport("SourceMapSource", () => require("./SourceMapSource"));
lazyExport("CachedSource", () => require("./CachedSource"));
lazyExport("ConcatSource", () => require("./ConcatSource"));
lazyExport("ReplaceSource", () => require("./ReplaceSource"));
lazyExport("PrefixSource", () => require("./PrefixSource"));
lazyExport("SizeOnlySource", () => require("./SizeOnlySource"));
lazyExport("CompatSource", () => require("./CompatSource"));
