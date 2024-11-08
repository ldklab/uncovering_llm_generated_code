/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

function lazyProperty(object, propertyName, initializer) {
	let cachedValue;
	let isInitialized = false;

	Object.defineProperty(object, propertyName, {
		get() {
			if (!isInitialized) {
				cachedValue = initializer();
				isInitialized = true;
			}
			return cachedValue;
		},
		configurable: true
	});
}

lazyProperty(exports, "Source", () => require("./Source"));
lazyProperty(exports, "RawSource", () => require("./RawSource"));
lazyProperty(exports, "OriginalSource", () => require("./OriginalSource"));
lazyProperty(exports, "SourceMapSource", () => require("./SourceMapSource"));
lazyProperty(exports, "CachedSource", () => require("./CachedSource"));
lazyProperty(exports, "ConcatSource", () => require("./ConcatSource"));
lazyProperty(exports, "ReplaceSource", () => require("./ReplaceSource"));
lazyProperty(exports, "PrefixSource", () => require("./PrefixSource"));
lazyProperty(exports, "SizeOnlySource", () => require("./SizeOnlySource"));
lazyProperty(exports, "CompatSource", () => require("./CompatSource"));
