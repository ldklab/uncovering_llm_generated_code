// File: ts-loader.js

const path = require('path');
const ts = require('typescript');
const { getOptions, stringifyRequest } = require('loader-utils');

module.exports = function(source) {
  const options = getOptions(this) || {};
  const callback = this.async();

  // Setup compiler options with defaults
  const defaultCompilerOptions = { sourceMap: true };
  const compilerOptions = {
    ...defaultCompilerOptions,
    ...options.compilerOptions
  };

  // Resolve config path or lookup tsconfig.json
  const configPath = options.configFile
    ? path.resolve(this.context, options.configFile)
    : ts.findConfigFile(this.context, ts.sys.fileExists, 'tsconfig.json');

  let config = {};
  if (configPath) {
    const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
    if (!readResult.error) {
      config = readResult.config;
    }
  }

  // Parse config file and extend compiler options
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    this.context
  );
  Object.assign(compilerOptions, parsedCommandLine.options);

  // Transpile TypeScript source
  const result = ts.transpileModule(source, {
    compilerOptions,
    reportDiagnostics: !options.transpileOnly,
    fileName: this.resourcePath
  });

  // Emit errors if needed
  if (!options.transpileOnly && result.diagnostics.length) {
    result.diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      this.emitError(new Error(`TS [${diagnostic.code}]: ${message} at ${line + 1}:${character + 1}`));
    });
  }

  // Return the transpiled code and source map
  callback(null, result.outputText, result.sourceMapText);
};
