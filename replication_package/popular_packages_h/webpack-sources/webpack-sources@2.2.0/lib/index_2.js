/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const lazyExport = (name, modulePath) => {
	let cachedModule;
	Object.defineProperty(exports, name, {
		get: () => {
			if (!cachedModule) {
				cachedModule = require(modulePath);
			}
			return cachedModule;
		},
		configurable: true
	});
};

lazyExport("Source", "./Source");
lazyExport("RawSource", "./RawSource");
lazyExport("OriginalSource", "./OriginalSource");
lazyExport("SourceMapSource", "./SourceMapSource");
lazyExport("CachedSource", "./CachedSource");
lazyExport("ConcatSource", "./ConcatSource");
lazyExport("ReplaceSource", "./ReplaceSource");
lazyExport("PrefixSource", "./PrefixSource");
lazyExport("SizeOnlySource", "./SizeOnlySource");
lazyExport("CompatSource", "./CompatSource");
