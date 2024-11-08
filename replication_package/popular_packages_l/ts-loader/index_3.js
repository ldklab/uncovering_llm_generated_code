// Custom TypeScript Webpack loader

const path = require('path');
const ts = require('typescript');
const { getOptions } = require('loader-utils');

module.exports = function(source) {
  const options = getOptions(this) || {};
  const callback = this.async();

  // Default compiler options with optional user settings
  const compilerOptions = Object.assign({ sourceMap: true }, options.compilerOptions);

  // Determine the config file path, defaulting to tsconfig.json if not specified
  let configPath = options.configFile
    ? path.resolve(this.context, options.configFile)
    : ts.findConfigFile(this.context, ts.sys.fileExists, 'tsconfig.json');

  // Load and parse the configuration from the config file
  let config = configPath ? ts.readConfigFile(configPath, ts.sys.readFile).config : {};
  const parsedConfig = ts.parseJsonConfigFileContent(config, ts.sys, this.context);

  // Merge parsed compiler options into overall compiler settings
  Object.assign(compilerOptions, parsedConfig.options);

  // Transpile the source using TypeScript
  const result = ts.transpileModule(source, {
    compilerOptions,
    reportDiagnostics: !options.transpileOnly,
    fileName: this.resourcePath
  });

  // Emit errors for diagnostics, unless transpileOnly is true
  if (!options.transpileOnly && result.diagnostics.length) {
    result.diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      this.emitError(new Error(`TS [${diagnostic.code}]: ${message} at ${line + 1}:${character + 1}`));
    });
  }

  // Return the transpiled JavaScript and source map
  callback(null, result.outputText, result.sourceMapText);
};
