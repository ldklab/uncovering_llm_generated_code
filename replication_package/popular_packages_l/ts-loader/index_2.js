// File: ts-loader.js

const path = require('path');
const ts = require('typescript');
const { getOptions } = require('loader-utils');

module.exports = function(source) {
  const options = getOptions(this) || {};
  const callback = this.async();
  
  // Default compiler options, extendable from user input
  const defaultCompilerOptions = { sourceMap: true };
  const userCompilerOptions = options.compilerOptions || {};
  const compilerOptions = { ...defaultCompilerOptions, ...userCompilerOptions };

  // Resolve the TypeScript configuration file
  const configFile = options.configFile 
    ? path.resolve(this.context, options.configFile) 
    : ts.findConfigFile(this.context, ts.sys.fileExists, 'tsconfig.json');
  
  let config = {};
  if (configFile) {
    config = ts.readConfigFile(configFile, ts.sys.readFile).config || {};
  }
  
  const parsedConfig = ts.parseJsonConfigFileContent(config, ts.sys, this.context);
  Object.assign(compilerOptions, parsedConfig.options);

  // Transpile the TypeScript source code
  const transpileResult = ts.transpileModule(source, {
    compilerOptions,
    fileName: this.resourcePath,
    reportDiagnostics: !options.transpileOnly
  });

  // Handle any diagnostics (errors/warnings)
  if (!options.transpileOnly && transpileResult.diagnostics.length > 0) {
    transpileResult.diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const error = new Error(`TS [${diagnostic.code}]: ${message} at ${position.line + 1}:${position.character + 1}`);
      this.emitError(error);
    });
  }

  // Return the output JavaScript and source map to Webpack
  callback(null, transpileResult.outputText, transpileResult.sourceMapText);
};
