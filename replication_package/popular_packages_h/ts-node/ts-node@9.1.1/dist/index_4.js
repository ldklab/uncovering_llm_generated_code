"use strict";

const path = require("path");
const sourceMapSupport = require("source-map-support");
const util = require("util");
const module = require("module");
const yn = require("yn");
const { BaseError } = require("make-error");

// Create a require function to load modules, compatible with different Node.js versions
const createRequire = module.createRequire || module.createRequireFromPath || require('create-require');

// Check if the current Node.js version supports package.json "type" field
const supportsPackageTypeField = parseInt(process.versions.node.split('.')[0], 10) >= 12;

// Symbol for tracking registered `ts-node` instances
const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');
// Internal method for custom inspection of errors
const INSPECT_CUSTOM = util.inspect.custom || 'inspect';

// Helper function to parse environment variables with `yn` module
function ynParse(value) {
  return yn(value) !== null ? yn(value) : undefined;
}

const shouldDebug = ynParse(process.env.TS_NODE_DEBUG);

// Debugging utility
const debug = shouldDebug ? (...args) => console.log(`[ts-node ${new Date().toISOString()}]`, ...args) : () => undefined;

// Function to assign properties, ignoring undefined ones
function assign(target, ...sources) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const value = source[key];
      if (value !== undefined) target[key] = value;
    }
  }
  return target;
}

// TypeScript Error class for handling TypeScript compilation diagnostics
class TSError extends BaseError {
  constructor(diagnosticText, diagnosticCodes) {
    super(`⨯ Unable to compile TypeScript:\n${diagnosticText}`);
    this.diagnosticText = diagnosticText;
    this.diagnosticCodes = diagnosticCodes;
    this.name = 'TSError';
  }

  [INSPECT_CUSTOM]() {
    return this.diagnosticText;
  }
}

// Split a string into an array, based on delimiter `,`
function splitString(value) {
  return typeof value === 'string' ? value.split(/ *, */g) : undefined;
}

// Parse JSON encoded strings
function parseJSON(value) {
  return typeof value === 'string' ? JSON.parse(value) : undefined;
}

// Replace all backslashes with forward slashes
function normalizeSlashes(value) {
  return value.replace(/\\/g, '/');
}

// Default options for `ts-node` registration
const DEFAULTS = {
  dir: process.env.TS_NODE_DIR,
  emit: ynParse(process.env.TS_NODE_EMIT),
  scope: ynParse(process.env.TS_NODE_SCOPE),
  files: ynParse(process.env.TS_NODE_FILES),
  pretty: ynParse(process.env.TS_NODE_PRETTY),
  compiler: process.env.TS_NODE_COMPILER,
  compilerOptions: parseJSON(process.env.TS_NODE_COMPILER_OPTIONS),
  ignore: splitString(process.env.TS_NODE_IGNORE),
  project: process.env.TS_NODE_PROJECT,
  skipProject: ynParse(process.env.TS_NODE_SKIP_PROJECT),
  skipIgnore: ynParse(process.env.TS_NODE_SKIP_IGNORE),
  preferTsExts: ynParse(process.env.TS_NODE_PREFER_TS_EXTS),
  ignoreDiagnostics: splitString(process.env.TS_NODE_IGNORE_DIAGNOSTICS),
  transpileOnly: ynParse(process.env.TS_NODE_TRANSPILE_ONLY),
  typeCheck: ynParse(process.env.TS_NODE_TYPE_CHECK),
  compilerHost: ynParse(process.env.TS_NODE_COMPILER_HOST),
  logError: ynParse(process.env.TS_NODE_LOG_ERROR),
  experimentalEsmLoader: false,
};

// TypeScript compiler option values that cannot be overridden
const TS_NODE_COMPILER_OPTIONS = {
  sourceMap: true,
  inlineSourceMap: false,
  inlineSources: true,
  declaration: false,
  noEmit: false,
  outDir: '.ts-node',
};

// Function to create and return a ts-node instance
function create(rawOptions = {}) {
  const options = assign({}, DEFAULTS, rawOptions);
  const cwd = options.dir ? path.resolve(options.dir) : process.cwd();
  const compilerName = options.compiler || 'typescript';
  
  const ts = loadCompiler(compilerName, cwd);
  const config = readConfig(cwd, ts, rawOptions);
  const outputCache = new Map();

  // Setup source map support
  sourceMapSupport.install({
    environment: 'node',
    retrieveFile: (pathOrUrl) => {
      let path = pathOrUrl.startsWith('file://') ? convertFileUrlToPath(pathOrUrl) : pathOrUrl;
      path = normalizeSlashes(path);
      return outputCache.get(path)?.content || '';
    },
  });

  // Compile TypeScript file and update output cache
  function compile(code, fileName) {
    const [value, sourceMap] = getOutput(ts, code, fileName, config);
    const output = updateOutput(value, normalizeSlashes(fileName), sourceMap, getExtension(ts, config));
    outputCache.set(normalizeSlashes(fileName), { content: output });
    return output;
  }

  return { compile };
}

// Load a TypeScript compiler
function loadCompiler(name, cwd) {
  const compilerPath = require.resolve(name, { paths: [cwd, __dirname] });
  return require(compilerPath);
}

// Create an array of extensions supported by TypeScript
function getExtensions(ts, config) {
  const tsExtensions = ['.ts'];
  const jsExtensions = [];
  if (config.options.jsx) tsExtensions.push('.tsx');
  if (config.options.allowJs) jsExtensions.push('.js');
  if (config.options.jsx && config.options.allowJs) jsExtensions.push('.jsx');
  return { tsExtensions, jsExtensions };
}

// Read and fix configuration
function readConfig(cwd, ts, rawOptions) {
  const configFileName = findConfigFile(cwd, ts, rawOptions);
  const config = configFileName ? ts.readConfigFile(configFileName, ts.sys.readFile).config : { compilerOptions: {} };
  const fixedConfig = fixConfig(ts, config);
  return ts.parseJsonConfigFileContent(fixedConfig, ts.sys, path.dirname(configFileName));
}

// Resolve TypeScript configuration file
function findConfigFile(cwd, ts, options) {
  const project = options.project || DEFAULTS.project;
  const skipProject = options.skipProject || DEFAULTS.skipProject;
  return skipProject ? undefined : project ? path.resolve(cwd, project) : ts.findConfigFile(cwd, ts.sys.fileExists);
}

// Apply necessary fixes to TypeScript configuration
function fixConfig(ts, config) {
  delete config.options.out;
  delete config.options.outFile;
  delete config.options.composite;
  delete config.options.declarationDir;
  delete config.options.declarationMap;
  delete config.options.emitDeclarationOnly;

  config.options.target = config.options.target || ts.ScriptTarget.ES5;
  config.options.module = config.options.module || ts.ModuleKind.CommonJS;

  return config;
}

// Convert file URL to path
function convertFileUrlToPath(url) {
  return url.startsWith('file://') ? path.fileURLToPath(url) : url;
}

// Get the output and source map of compiled TypeScript
function getOutput(ts, code, fileName, config) {
  const result = ts.transpileModule(code, {
    compilerOptions: config.options,
    fileName,
    reportDiagnostics: true,
  });

  if (result.diagnostics.length) filterAndReportDiagnostics(ts, result.diagnostics);
  return [result.outputText, result.sourceMapText];
}

// Filter and report diagnostics
function filterAndReportDiagnostics(ts, diagnostics) {
  const filtered = diagnostics.filter(d => !DEFAULTS.ignoreDiagnostics.includes(d.code));
  if (filtered.length) throw new TSError(ts.formatDiagnostics(filtered, createDiagnosticHost(ts)), filtered.map(d => d.code));
}

// Create a diagnostic host for formatting diagnostics
function createDiagnosticHost(ts) {
  return {
    getNewLine: () => ts.sys.newLine,
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? (f => f) : (f => f.toLowerCase()),
  };
}

// Update the output file with a source map
function updateOutput(outputText, fileName, sourceMapText, getExtension) {
  const base64Map = Buffer.from(updateSourceMap(sourceMapText, fileName), 'utf8').toString('base64');
  const sourceMapContent = `data:application/json;charset=utf-8;base64,${base64Map}`;
  const sourceMapLength = `${path.basename(fileName)}.map`.length + (getExtension(path.extname(fileName)) - path.extname(fileName).length);

  return outputText.slice(0, -sourceMapLength) + sourceMapContent;
}

// Update the source map content for accurate mapping
function updateSourceMap(sourceMapText, fileName) {
  const sourceMap = JSON.parse(sourceMapText);
  sourceMap.file = fileName;
  sourceMap.sources = [fileName];
  delete sourceMap.sourceRoot;
  return JSON.stringify(sourceMap);
}

exports.create = create;
exports.TSError = TSError;
