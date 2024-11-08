/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

function lazyLoadModule(name, moduleLoader) {
	let moduleCache;
	Object.defineProperty(exports, name, {
		get() {
			if (moduleLoader !== undefined) {
				moduleCache = moduleLoader();
				moduleLoader = undefined;
			}
			return moduleCache;
		},
		configurable: true
	});
}

lazyLoadModule("Source", () => require("./Source"));

lazyLoadModule("RawSource", () => require("./RawSource"));
lazyLoadModule("OriginalSource", () => require("./OriginalSource"));
lazyLoadModule("SourceMapSource", () => require("./SourceMapSource"));
lazyLoadModule("CachedSource", () => require("./CachedSource"));
lazyLoadModule("ConcatSource", () => require("./ConcatSource"));
lazyLoadModule("ReplaceSource", () => require("./ReplaceSource"));
lazyLoadModule("PrefixSource", () => require("./PrefixSource"));
lazyLoadModule("SizeOnlySource", () => require("./SizeOnlySource"));
lazyLoadModule("CompatSource", () => require("./CompatSource"));
