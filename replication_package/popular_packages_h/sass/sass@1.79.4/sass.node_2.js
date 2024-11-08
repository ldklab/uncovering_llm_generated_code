require('./sass.dart.js');

const cliPackageExports = globalThis._cliPkgExports;
const library = cliPackageExports.pop();

if (cliPackageExports.length === 0) {
  delete globalThis._cliPkgExports;
}

const modules = {
  util: require("util"),
  stream: require("stream"),
  nodeModule: require("module"),
  fs: require("fs"),
  immutable: require("immutable"),
};

library.load(modules);

module.exports = library;
