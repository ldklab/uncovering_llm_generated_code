require('./sass.dart.js');

function initializeLibrary() {
  const libraryExports = globalThis._cliPkgExports;
  const library = libraryExports.pop(); 

  if (libraryExports.length === 0) {
    delete globalThis._cliPkgExports;
  }

  library.load({
    util: require("util"),
    stream: require("stream"),
    nodeModule: require("module"),
    fs: require("fs"),
    immutable: require("immutable"),
  });

  return library;
}

const library = initializeLibrary();
module.exports = library;
