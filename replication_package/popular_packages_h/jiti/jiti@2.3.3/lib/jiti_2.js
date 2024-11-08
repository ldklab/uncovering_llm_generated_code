const { createRequire } = require("node:module");
const _createJiti = require("../dist/jiti.cjs");
const transform = require("../dist/babel.cjs");

function handleImportError(err) {
  throw err;
}

const dynamicImport = (id) => import(id);

function instantiateJiti(id, options = {}) {
  const finalOptions = options.transform ? options : { ...options, transform };
  return _createJiti(id, finalOptions, {
    onError: handleImportError,
    nativeImport: dynamicImport,
    createRequire,
  });
}

module.exports = instantiateJiti;
module.exports.instantiateJiti = instantiateJiti;
