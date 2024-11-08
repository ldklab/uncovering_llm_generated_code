"use strict";

const { loadBinding } = require("@node-rs/helper");
const { compileBundleOptions } = require("./spack");

// Load SWC bindings
const bindings = loadBinding(__dirname, "swc", "@swc/core");

// Export SWC version
exports.version = require("./package.json").version;

// Default extensions supported by SWC
exports.DEFAULT_EXTENSIONS = Object.freeze([
  ".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"
]);

// Plugin system for modifying modules
function plugins(pluginList) {
  return module => {
    return pluginList.reduce((modifiedModule, plugin) => plugin(modifiedModule), module);
  };
}

exports.plugins = plugins;

// Compiler class encapsulates parsing, printing, transforming, and bundling methods
class Compiler {
  // Async and sync parsing methods
  async parse(src, options = { syntax: "ecmascript" }) {
    options.syntax = options.syntax || "ecmascript";
    const result = await bindings.parse(src, toBuffer(options));
    return JSON.parse(result);
  }

  parseSync(src, options = { syntax: "ecmascript" }) {
    options.syntax = options.syntax || "ecmascript";
    return JSON.parse(bindings.parseSync(src, toBuffer(options)));
  }

  async parseFile(path, options = { syntax: "ecmascript" }) {
    options.syntax = options.syntax || "ecmascript";
    const result = bindings.parseFile(path, toBuffer(options));
    return JSON.parse(result);
  }

  parseFileSync(path, options = { syntax: "ecmascript" }) {
    options.syntax = options.syntax || "ecmascript";
    return JSON.parse(bindings.parseFileSync(path, toBuffer(options)));
  }

  // Async and sync printing methods
  async print(module, options = {}) {
    return bindings.print(JSON.stringify(module), toBuffer(options));
  }

  printSync(module, options = {}) {
    return bindings.printSync(JSON.stringify(module), toBuffer(options));
  }

  // Async and sync transforming methods
  async transform(src, options = {}) {
    const isModule = typeof src !== "string";
    options = this.ensureSyntax(options);

    const { plugin } = options;
    delete options.plugin;

    if (plugin) {
      const module = typeof src === "string" ? await this.parse(src, options.jsc?.parser) : src;
      return this.transform(plugin(module), options);
    }

    return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
  }

  transformSync(src, options = {}) {
    const isModule = typeof src !== "string";
    options = this.ensureSyntax(options);

    const { plugin } = options;
    delete options.plugin;

    if (plugin) {
      const module = typeof src === "string" ? this.parseSync(src, options.jsc?.parser) : src;
      return this.transformSync(plugin(module), options);
    }

    return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
  }

  async transformFile(path, options = {}) {
    options = this.ensureSyntax(options);

    const { plugin } = options;
    delete options.plugin;

    if (plugin) {
      const module = await this.parseFile(path, options.jsc?.parser);
      return this.transform(plugin(module), options);
    }

    return bindings.transformFile(path, false, toBuffer(options));
  }

  transformFileSync(path, options = {}) {
    options = this.ensureSyntax(options);

    const { plugin } = options;
    delete options.plugin;

    if (plugin) {
      const module = this.parseFileSync(path, options.jsc?.parser);
      return this.transformSync(plugin(module), options);
    }

    return bindings.transformFileSync(path, false, toBuffer(options));
  }

  // Bundling method
  async bundle(options) {
    const compiledOptions = await compileBundleOptions(options);

    if (Array.isArray(compiledOptions)) {
      const results = await Promise.all(compiledOptions.map(opt => this.bundle(opt)));
      return results.reduce((acc, obj) => ({ ...acc, ...obj }), {});
    }

    return bindings.bundle(toBuffer({ ...compiledOptions }));
  }

  // Helper for ensuring syntax option is set
  ensureSyntax(options) {
    if (options?.jsc?.parser) {
      options.jsc.parser.syntax = options.jsc.parser.syntax || 'ecmascript';
    }
    return options;
  }
}

exports.Compiler = Compiler;

// Instance of our Compiler class
const compiler = new Compiler();

// Convenience wrapper functions
const createWrapper = method => (firstArg, secondArg) => compiler[method](firstArg, secondArg);
exports.parse = createWrapper('parse');
exports.parseSync = createWrapper('parseSync');
exports.parseFile = createWrapper('parseFile');
exports.parseFileSync = createWrapper('parseFileSync');
exports.print = createWrapper('print');
exports.printSync = createWrapper('printSync');
exports.transform = createWrapper('transform');
exports.transformSync = createWrapper('transformSync');
exports.transformFile = createWrapper('transformFile');
exports.transformFileSync = createWrapper('transformFileSync');
exports.bundle = createWrapper('bundle');

// Helper function to convert options to Buffer
function toBuffer(optionsObj) {
  return Buffer.from(JSON.stringify(optionsObj));
}
