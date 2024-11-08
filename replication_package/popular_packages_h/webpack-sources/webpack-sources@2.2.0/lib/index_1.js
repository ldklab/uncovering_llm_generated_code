/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const defineLazyExport = (propName, moduleLoaderFn) => {
	let cachedModule;
	Object.defineProperty(exports, propName, {
		get: () => {
			if (moduleLoaderFn) {
				cachedModule = moduleLoaderFn();
				moduleLoaderFn = undefined;
			}
			return cachedModule;
		},
		configurable: true
	});
};

defineLazyExport("Source", () => require("./Source"));
defineLazyExport("RawSource", () => require("./RawSource"));
defineLazyExport("OriginalSource", () => require("./OriginalSource"));
defineLazyExport("SourceMapSource", () => require("./SourceMapSource"));
defineLazyExport("CachedSource", () => require("./CachedSource"));
defineLazyExport("ConcatSource", () => require("./ConcatSource"));
defineLazyExport("ReplaceSource", () => require("./ReplaceSource"));
defineLazyExport("PrefixSource", () => require("./PrefixSource"));
defineLazyExport("SizeOnlySource", () => require("./SizeOnlySource"));
defineLazyExport("CompatSource", () => require("./CompatSource"));
