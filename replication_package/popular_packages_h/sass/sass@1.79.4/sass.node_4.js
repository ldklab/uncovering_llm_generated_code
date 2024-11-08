require('./sass.dart.js');

const importedLibrary = globalThis._cliPkgExports.pop();

if (globalThis._cliPkgExports.length === 0) {
  delete globalThis._cliPkgExports;
}

importedLibrary.load({
  util: require("util"),
  stream: require("stream"),
  nodeModule: require("module"),
  fs: require("fs"),
  immutable: require("immutable"),
});

module.exports = importedLibrary;
