// index.js
const Module = require('module');
const originalLoad = Module._load;

function addHook(hook, opts = {}) {
  const matcher = opts.matcher || (() => true);
  const exts = opts.exts || ['.js'];
  const ignoreNodeModules = opts.ignoreNodeModules !== undefined ? opts.ignoreNodeModules : true;

  const shouldHook = (filename) => {
    if (ignoreNodeModules && /node_modules/.test(filename)) {
      return false;
    }
    return matcher(filename);
  };

  function loader(module, filename) {
    const ext = `.${filename.split('.').pop()}`;
    if (exts.includes(ext) && shouldHook(filename)) {
      const _compile = module._compile;
      module._compile = function (code, filename) {
        const newCode = hook(code, filename);
        return _compile.call(this, newCode, filename);
      };
    }
    return originalLoad.apply(this, arguments);
  }

  Module._load = loader;

  return function revert() {
    Module._load = originalLoad;
  };
}

module.exports.addHook = addHook;
