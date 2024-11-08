// File: ts-loader.js

const path = require('path');
const ts = require('typescript');
const { getOptions, stringifyRequest } = require('loader-utils');

module.exports = function(source) {
  const options = getOptions(this) || {};
  const callback = this.async();
  
  const defaultCompilerOptions = { sourceMap: true };
  const userCompilerOptions = options.compilerOptions || {};
  const compilerOptions = { ...defaultCompilerOptions, ...userCompilerOptions };

  const configFilePath = options.configFile
    ? path.resolve(this.context, options.configFile)
    : ts.findConfigFile(this.context, ts.sys.fileExists, 'tsconfig.json');
  
  const tsConfig = configFilePath
    ? ts.readConfigFile(configFilePath, ts.sys.readFile).config
    : {};
  
  const parsedConfig = ts.parseJsonConfigFileContent(
    tsConfig,
    ts.sys,
    this.context
  );

  Object.assign(compilerOptions, parsedConfig.options);

  const transpilationResult = ts.transpileModule(source, {
    compilerOptions,
    reportDiagnostics: !options.transpileOnly,
    fileName: this.resourcePath
  });

  if (!options.transpileOnly && transpilationResult.diagnostics.length) {
    transpilationResult.diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      this.emitError(new Error(`TS [${diagnostic.code}]: ${message} at ${line + 1}:${character + 1}`));
    });
  }

  callback(null, transpilationResult.outputText, transpilationResult.sourceMapText);
};
