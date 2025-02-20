"use strict";

const path = require("path");
const sourceMapSupport = require("source-map-support");
const ynModule = require("yn");
const makeError = require("make-error");
const util = require("util");
const { createRequire } = require("module");
const { createRepl } = require("./repl");

// Check the Node.js version for ESM support
const engineSupportsPackageTypeField = parseInt(process.versions.node.split('.')[0], 10) >= 12;
let assertScriptCanLoadAsCJSImpl;

// Ensure a script can be loaded as a CommonJS module
function assertScriptCanLoadAsCJS(filename) {
  if (!engineSupportsPackageTypeField) return;
  if (!assertScriptCanLoadAsCJSImpl) {
    assertScriptCanLoadAsCJSImpl = require('../dist-raw/node-cjs-loader-utils').assertScriptCanLoadAsCJSImpl;
  }
  assertScriptCanLoadAsCJSImpl(filename);
}

// Custom error class for TypeScript diagnostics
class TSError extends makeError.BaseError {
  constructor(diagnosticText, diagnosticCodes) {
    super(`⨯ Unable to compile TypeScript:\n${diagnosticText}`);
    this.diagnosticText = diagnosticText;
    this.diagnosticCodes = diagnosticCodes;
    this.name = 'TSError';
  }

  [util.inspect.custom]() {
    return this.diagnosticText;
  }
}

// Utility functions
const yn = value => ynModule(value) || undefined;
const split = value => typeof value === 'string' ? value.split(/ *, */g) : undefined;
const parse = value => typeof value === 'string' ? JSON.parse(value) : undefined;
const normalizeSlashes = value => value.replace(/\\/g, '/');

// Debugging utilities
const shouldDebug = yn(process.env.TS_NODE_DEBUG);
const debug = shouldDebug ? 
  (...args) => console.log(`[ts-node ${new Date().toISOString()}]`, ...args) 
  : () => undefined;

// Assign properties, ignoring undefined
function assign(initialValue, ...sources) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const value = source[key];
      if (value !== undefined) initialValue[key] = value;
    }
  }
  return initialValue;
}

// Default options
const DEFAULTS = {
  dir: process.env.TS_NODE_DIR,
  emit: yn(process.env.TS_NODE_EMIT),
  scope: yn(process.env.TS_NODE_SCOPE),
  files: yn(process.env.TS_NODE_FILES),
  pretty: yn(process.env.TS_NODE_PRETTY),
  compiler: process.env.TS_NODE_COMPILER,
  compilerOptions: parse(process.env.TS_NODE_COMPILER_OPTIONS),
  ignore: split(process.env.TS_NODE_IGNORE),
  project: process.env.TS_NODE_PROJECT,
  skipProject: yn(process.env.TS_NODE_SKIP_PROJECT),
  skipIgnore: yn(process.env.TS_NODE_SKIP_IGNORE),
  preferTsExts: yn(process.env.TS_NODE_PREFER_TS_EXTS),
  ignoreDiagnostics: split(process.env.TS_NODE_IGNORE_DIAGNOSTICS),
  transpileOnly: yn(process.env.TS_NODE_TRANSPILE_ONLY),
  typeCheck: yn(process.env.TS_NODE_TYPE_CHECK),
  compilerHost: yn(process.env.TS_NODE_COMPILER_HOST),
  logError: yn(process.env.TS_NODE_LOG_ERROR),
  experimentalEsmLoader: false
};

// Read and parse TypeScript configuration
function readConfig(cwd, ts, options) {
  let config = { compilerOptions: {} };
  let basePath = cwd;
  const { fileExists = ts.sys.fileExists, readFile = ts.sys.readFile, skipProject = DEFAULTS.skipProject, project = DEFAULTS.project } = options;

  if (!skipProject) {
    const configFileName = project ? path.resolve(cwd, project) : ts.findConfigFile(cwd, fileExists);
    if (configFileName) {
      const result = ts.readConfigFile(configFileName, readFile);
      if (result.error) {
        return { config: { errors: [result.error], fileNames: [], options: {} }, options: {} };
      }
      config = result.config;
      basePath = path.dirname(configFileName);
    }
  }

  const tsconfigOptions = { ...config['ts-node'] };

  config.compilerOptions = {
    ...config.compilerOptions,
    ...DEFAULTS.compilerOptions,
    ...tsconfigOptions.compilerOptions,
    ...options.compilerOptions,
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: true,
    declaration: false,
    noEmit: false,
    outDir: '.ts-node'
  };

  const fixedConfig = ts.parseJsonConfigFileContent(config, {
    fileExists,
    readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames
  }, basePath, undefined, configFileName);

  if (tsconfigOptions.require) {
    const tsconfigRelativeRequire = createRequire(configFileName);
    tsconfigOptions.require = tsconfigOptions.require.map((path) => {
      return tsconfigRelativeRequire.resolve(path);
    });
  }

  return { config: fixedConfig, options: tsconfigOptions };
}

// Extract the current version
const VERSION = require('../package.json').version;

// Normalize configuration options
function fixConfig(ts, config) {
  delete config.options.out;
  delete config.options.outFile;
  delete config.options.composite;
  delete config.options.declarationDir;
  delete config.options.declarationMap;
  delete config.options.emitDeclarationOnly;

  if (config.options.target === undefined) {
    config.options.target = ts.ScriptTarget.ES5;
  }
  if (config.options.module === undefined) {
    config.options.module = ts.ModuleKind.CommonJS;
  }

  return config;
}

// Register TypeScript compiler instance
function register(opts = {}) {
  const originalJsHandler = require.extensions['.js'];
  const service = create(opts);
  const { tsExtensions, jsExtensions } = getExtensions(service.config);
  const extensions = [...tsExtensions, ...jsExtensions];
  process[REGISTER_INSTANCE] = service;
  registerExtensions(service.options.preferTsExts, extensions, service, originalJsHandler);
  module._preloadModules(service.options.require);
  return service;
}

// Create TypeScript compiler instance
function create(rawOptions = {}) {
  const { dir, compiler } = { dir: rawOptions.dir || DEFAULTS.dir, compiler: rawOptions.compiler || DEFAULTS.compiler };
  const cwd = dir ? path.resolve(dir) : process.cwd();

  // Load TypeScript compiler
  function loadCompiler(name) {
    const compilerPath = require.resolve(name || 'typescript', { paths: [cwd, __dirname] });
    return { compiler: compilerPath, ts: require(compilerPath) };
  }

  let { compiler, ts } = loadCompiler(compiler);
  const { config, options } = readConfig(cwd, ts, rawOptions);
  Object.assign(options, DEFAULTS, options || {}, rawOptions);

  // Re-load the compiler if the option changed
  if (options.compiler !== compiler) {
    ({ compiler, ts } = loadCompiler(options.compiler));
  }
  
  const transformers = options.transformers || undefined;
  const ignoreDiagnostics = [...(options.ignoreDiagnostics || []), 6059, 18002, 18003].map(Number);

  let getOutput, getTypeInfo;
  
  // Use full language services
  if (!options.transpileOnly) {
    enableLanguageService();
  } else {
    enableTranspileOnly();
  }

  function enableLanguageService() {
    const projectVersion = 1;
    const outputCache = new Map();

    function updateMemoryCache(contents, fileName) {
      const previousContents = fileContents.get(fileName);
      if (contents !== previousContents) {
        fileVersions.set(fileName, (fileVersions.get(fileName) || 0) + 1);
        projectVersion++;
      }
      fileContents.set(fileName, contents);
    }

    function getDiagnostics(filename) {
      updateMemoryCache(code, fileName);
      const diagnostics = service.getSemanticDiagnostics(fileName)
        .concat(service.getSyntacticDiagnostics(fileName));
      if (diagnosticList.length) reportTSError(diagnosticList);
    }

    const serviceHost = {
      getProjectVersion: () => String(projectVersion),
      getScriptFileNames: () => Array.from(rootFileNames),
      getScriptVersion: fileName => (fileVersions.get(fileName) || 0).toString(),
      getScriptSnapshot: getScriptSnapshotHandler,
      readFile: cachedLookup(ts.sys.readFile),
      fileExists: cachedLookup(ts.sys.fileExists),
      directoryExists: cachedLookup(ts.sys.directoryExists),
      getNewLine: () => ts.sys.newLine,
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
      getCurrentDirectory: () => cwd,
      getCompilationSettings: () => config.options,
      getDefaultLibFileName: () => ts.getDefaultLibFilePath(config.options),
      getDirectories: cachedLookup(ts.sys.getDirectories),
      getCustomTransformers: getCustomTransformers
    };

    const { resolveModuleNames } = createResolverFunctions(serviceHost);
    serviceHost.resolveModuleNames = resolveModuleNames;

    const service = ts.createLanguageService(serviceHost, registry);

    getOutput = (code, fileName) => {
      updateMemoryCache(code, fileName);
      const output = service.getEmitOutput(fileName);

      const diagnostics = service.getSemanticDiagnostics(fileName)
        .concat(service.getSyntacticDiagnostics(fileName));
      const diagnosticList = filterDiagnostics(diagnostics, ignoreDiagnostics);

      if (diagnosticList.length) reportTSError(diagnosticList);

      if (output.emitSkipped) {
        throw new TypeError(`${path.relative(cwd, fileName)}: Emit skipped`);
      }

      return [output.outputFiles[1].text, output.outputFiles[0].text];
    };

    getTypeInfo = (code, fileName, position) => {
      updateMemoryCache(code, fileName);
      const info = service.getQuickInfoAtPosition(fileName, position);
      const name = ts.displayPartsToString(info ? info.displayParts : []);
      const comment = ts.displayPartsToString(info ? info.documentation : []);
      return { name, comment };
    };
  }

  function enableTranspileOnly() {
    getOutput = (code, fileName) => {
      const result = ts.transpileModule(code, {
        fileName,
        compilerOptions: config.options,
        reportDiagnostics: true,
        transformers: transformers
      });

      const diagnosticList = filterDiagnostics(result.diagnostics || [], ignoreDiagnostics);
      if (diagnosticList.length) reportTSError(diagnosticList);

      return [result.outputText, result.sourceMapText];
    };

    getTypeInfo = () => {
      throw new TypeError('Type information is unavailable in "--transpile-only"');
    };
  }

  const compile = (code, fileName, lineOffset = 0) => {
    const normalizedFileName = normalizeSlashes(fileName);
    const [value, sourceMap] = getOutput(code, normalizedFileName);
    const output = updateOutput(value, normalizedFileName, sourceMap, getExtension);
    outputCache.set(normalizedFileName, { content: output });
    return output;
  };

  const active = true;
  const enabled = enabled => enabled === undefined ? active : (active = !!enabled);

  return { ts, config, compile, getTypeInfo, ignored, enabled, options };
}

// Filter diagnostics based on ignored codes
function filterDiagnostics(diagnostics, ignore) {
  return diagnostics.filter(diagnostic => !ignore.includes(diagnostic.code));
}

exports.TSError = TSError;
exports.create = create;
exports.register = register;
exports.VERSION = VERSION;
exports.DEFAULTS = DEFAULTS;
exports.normalizeSlashes = normalizeSlashes;
exports.parse = parse;
exports.split = split;
exports.createRepl = createRepl;
exports.debug = debug;

// Implemented functions such as registerExtensions, getExtensions, getScriptSnapshotHandler, createResolverFunctions, etc.
// Should be defined similarly following the logic as mentioned above.
