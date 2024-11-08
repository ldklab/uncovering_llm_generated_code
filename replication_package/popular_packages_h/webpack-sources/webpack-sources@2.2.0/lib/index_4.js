/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

// Function to lazily define exports with deferred module loading
const defineLazyExport = (exportName, requireFn) => {
	let cachedValue;
	Object.defineProperty(exports, exportName, {
		get: () => {
			if (requireFn !== undefined) {
				cachedValue = requireFn();
				// Ensure `requireFn` is called only once
				requireFn = undefined;
			}
			return cachedValue;
		},
		configurable: true
	});
};

// Lazy export of various modules, loading them only upon first access
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
