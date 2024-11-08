// File: ts-loader.js

const path = require('path');
const ts = require('typescript');
const { getOptions, stringifyRequest } = require('loader-utils');

module.exports = function(source) {
  const options = getOptions(this) || {};
  const callback = this.async();
  
  const compilerOptions = Object.assign(
    { sourceMap: true }, // Default to generating source maps
    options.compilerOptions // Custom compiler options from user
  );

  // Config file support
  const configPath = options.configFile
    ? path.resolve(this.context, options.configFile)
    : ts.findConfigFile(this.context, ts.sys.fileExists, 'tsconfig.json');
  
  const config = configPath
    ? ts.readConfigFile(configPath, ts.sys.readFile).config
    : {};
  
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    this.context
  );
  
  // Get compiler options from tsconfig.json
  Object.assign(compilerOptions, parsedCommandLine.options);

  // Transpile module
  const result = ts.transpileModule(source, {
    compilerOptions,
    reportDiagnostics: !options.transpileOnly,
    fileName: this.resourcePath
  });

  // Handle diagnostics if transpileOnly is false
  if (!options.transpileOnly && result.diagnostics.length) {
    for (const diagnostic of result.diagnostics) {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      this.emitError(new Error(`TS [${diagnostic.code}]: ${message} at ${line + 1}:${character + 1}`));
    }
  }

  // Return compiled JS and source map
  callback(null, result.outputText, result.sourceMapText);
};
