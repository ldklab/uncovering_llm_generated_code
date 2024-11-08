"use strict";

// Import necessary modules and define exports
import path from 'path';
import { Module } from 'module';
import util from 'util';
import { fileURLToPath } from 'url';
import { BaseError } from 'make-error';
import * as utils from './util';
import * as configuration from './configuration';
import * as moduleClassifier from './module-type-classifier';
import * as resolver from './resolver-functions';
import * as cjsHooks from './cjs-resolve-hooks';
import * as nodeModuleClassifier from './node-module-type-classifier';
import * as fileExtensions from './file-extensions';
import * as tsTranspileModule from './ts-transpile-module';
import { createRepl } from './repl';

// Determine if the current Node.js environment supports certain features
const engineSupportsPackageTypeField = parseInt(process.versions.node.split('.')[0], 10) >= 12;

// Conditional CJS assert function based on Node.js version support
let assertScriptCanLoadAsCJS = engineSupportsPackageTypeField
  ? require('../dist-raw/node-internal-modules-cjs-loader').assertScriptCanLoadAsCJSImpl
  : () => { /* noop */ };

// Define constants for internal and debug purposes
const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');
const env = process.env;
const INSPECT_CUSTOM = util.inspect.custom || 'inspect';
const shouldDebug = utils.yn(env.TS_NODE_DEBUG);
const debug = shouldDebug ? (...args) => console.log(`[ts-node ${new Date().toISOString()}]`, ...args) : () => undefined;
const VERSION = require('../package.json').version;

// Default options for TypeScript registration
const DEFAULTS = {
  cwd: env.TS_NODE_CWD ?? env.TS_NODE_DIR,
  emit: utils.yn(env.TS_NODE_EMIT),
  scope: utils.yn(env.TS_NODE_SCOPE),
  scopeDir: env.TS_NODE_SCOPE_DIR,
  files: utils.yn(env.TS_NODE_FILES),
  pretty: utils.yn(env.TS_NODE_PRETTY),
  compiler: env.TS_NODE_COMPILER,
  compilerOptions: utils.parse(env.TS_NODE_COMPILER_OPTIONS),
  ignore: utils.split(env.TS_NODE_IGNORE),
  project: env.TS_NODE_PROJECT,
  skipProject: utils.yn(env.TS_NODE_SKIP_PROJECT),
  skipIgnore: utils.yn(env.TS_NODE_SKIP_IGNORE),
  preferTsExts: utils.yn(env.TS_NODE_PREFER_TS_EXTS),
  ignoreDiagnostics: utils.split(env.TS_NODE_IGNORE_DIAGNOSTICS),
  transpileOnly: utils.yn(env.TS_NODE_TRANSPILE_ONLY),
  typeCheck: utils.yn(env.TS_NODE_TYPE_CHECK),
  compilerHost: utils.yn(env.TS_NODE_COMPILER_HOST),
  logError: utils.yn(env.TS_NODE_LOG_ERROR),
  experimentalReplAwait: utils.yn(env.TS_NODE_EXPERIMENTAL_REPL_AWAIT) ?? undefined,
  tsTrace: console.log.bind(console),
};

// TypeScript diagnostic error
class TSError extends BaseError {
  constructor(diagnosticText, diagnosticCodes, diagnostics = []) {
    super(`⨯ Unable to compile TypeScript:\n${diagnosticText}`);
    this.diagnosticCodes = diagnosticCodes;
    this.name = 'TSError';
    Object.defineProperty(this, 'diagnosticText', {
      configurable: true,
      writable: true,
      value: diagnosticText,
    });
    Object.defineProperty(this, 'diagnostics', {
      configurable: true,
      writable: true,
      value: diagnostics,
    });
  }
  [INSPECT_CUSTOM]() {
    return this.diagnosticText;
  }
}

// Register and create TypeScript hooks and environments
function register(serviceOrOpts) {
  let service = serviceOrOpts;
  if (!(serviceOrOpts?.[TS_NODE_SERVICE_BRAND])) {
    service = create(serviceOrOpts ?? {});
  }
  const originalJsHandler = require.extensions['.js'];
  process[REGISTER_INSTANCE] = service;
  registerExtensions(service.options.preferTsExts, service.extensions.compiled, service, originalJsHandler);
  cjsHooks.installCommonjsResolveHooksIfNecessary(service);
  Module._preloadModules(service.options.require);
  return service;
}

// Create and manage TypeScript compilation environment
function create(rawOptions = {}) {
  const foundConfigResult = configuration.findAndReadConfig(rawOptions);
  return createFromPreloadedConfig(foundConfigResult);
}

// Main logic for managing TypeScript environment configurations and compilation
function createFromPreloadedConfig(foundConfigResult) {
  const { configFilePath, cwd, options, config, compiler, projectLocalResolveDir, optionBasePaths } = foundConfigResult;
  const projectLocalResolveHelper = utils.createProjectLocalResolveHelper(projectLocalResolveDir);
  const ts = configuration.loadCompiler(compiler);
  const targetSupportsTla = config.options.target >= ts.ScriptTarget.ES2018;
  if (options.experimentalReplAwait && !targetSupportsTla) {
    throw new Error('Experimental REPL await is not compatible with targets lower than ES2018');
  }
  const tsVersionSupportsTla = utils.versionGteLt(ts.version, '3.8.0');
  if (options.experimentalReplAwait && !tsVersionSupportsTla) {
    throw new Error('Experimental REPL await is not compatible with TypeScript versions older than 3.8');
  }
  const shouldReplAwait = options.experimentalReplAwait !== false && tsVersionSupportsTla && targetSupportsTla;
  if (options.swc && !options.typeCheck) {
    if (options.transpileOnly === false) {
      throw new Error("Cannot enable 'swc' option with 'transpileOnly: false'.  'swc' implies 'transpileOnly'.");
    }
    if (options.transpiler) {
      throw new Error("Cannot specify both 'swc' and 'transpiler' options.  'swc' uses the built-in swc transpiler.");
    }
  }
  const readFile = options.readFile || ts.sys.readFile;
  const fileExists = options.fileExists || ts.sys.fileExists;
  const transpileOnly = (options.transpileOnly || options.swc) && options.typeCheck !== true;
  let transpiler;
  let transpilerBasePath;
  if (options.transpiler) {
    transpiler = options.transpiler;
    transpilerBasePath = optionBasePaths.transpiler;
  } else if (options.swc) {
    transpiler = require.resolve('./transpilers/swc.js');
    transpilerBasePath = optionBasePaths.swc;
  }
  const transformers = options.transformers || undefined;
  const diagnosticFilters = [{
    appliesToAllFiles: true,
    filenamesAbsolute: [],
    diagnosticsIgnored: [
      6059, 18002, 18003,
      ...(options.experimentalTsImportSpecifiers ? [2691] : []),
      ...(options.ignoreDiagnostics || []),
    ].map(Number),
  }];
  const configDiagnosticList = filterDiagnostics(config.errors, diagnosticFilters);
  const outputCache = new Map();
  const configFileDirname = configFilePath ? path.dirname(configFilePath) : null;
  const scopeDir = options.scopeDir ?? config.options.rootDir ?? configFileDirname ?? cwd;
  const ignoreBaseDir = configFileDirname ?? cwd;
  const isScoped = options.scope ? (fileName) => path.relative(scopeDir, fileName).charAt(0) !== '.' : () => true;
  const shouldIgnore = createIgnore(ignoreBaseDir, options.skipIgnore ? [] : (options.ignore || ['(?:^|/)node_modules/']).map((str) => new RegExp(str)));
  const diagnosticHost = {
    getNewLine: () => ts.sys.newLine,
    getCurrentDirectory: () => cwd,
    getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? (x) => x : (x) => x.toLowerCase(),
  };
  if (options.transpileOnly && typeof transformers === 'function') {
    throw new TypeError('Transformers function is unavailable in "--transpile-only"');
  }

  // Initialization functions
  let createTranspiler = initializeTranspilerFactory();
  function initializeTranspilerFactory() {
    if (transpiler) {
      if (!transpileOnly) throw new Error('Custom transpiler can only be used when transpileOnly is enabled.');
      const transpilerName = typeof transpiler === 'string' ? transpiler : transpiler[0];
      const transpilerOptions = typeof transpiler === 'string' ? {} : transpiler[1] ?? {};
      const transpilerConfigLocalResolveHelper = transpilerBasePath ? utils.createProjectLocalResolveHelper(transpilerBasePath) : projectLocalResolveHelper;
      const transpilerPath = transpilerConfigLocalResolveHelper(transpilerName, true);
      const transpilerFactory = require(transpilerPath).create;
      return function createTranspiler(compilerOptions, nodeModuleEmitKind) {
        return transpilerFactory({
          service: {
            options,
            config: { ...config, options: compilerOptions },
            projectLocalResolveHelper,
          },
          transpilerConfigLocalResolveHelper,
          nodeModuleEmitKind,
          ...transpilerOptions,
        });
      }
    }
  }

  // Source map support setup
  function enableExperimentalEsmLoaderInterop() { experimentalEsmLoader = true; }
  installSourceMapSupport();
  function installSourceMapSupport() {
    const sourceMapSupport = require('@cspotcode/source-map-support');
    sourceMapSupport.install({
      environment: 'node',
      retrieveFile(pathOrUrl) {
        let path = pathOrUrl;
        if (experimentalEsmLoader && path.startsWith('file://')) {
          try {
            path = fileURLToPath(path);
          } catch (e) { }
        }
        path = utils.normalizeSlashes(path);
        return outputCache.get(path)?.content || '';
      },
    });
  }

  // Diagnostic and custom transformer handling
  const shouldHavePrettyErrors = options.pretty === undefined ? process.stdout.isTTY : options.pretty;
  const formatDiagnostics = shouldHavePrettyErrors ? ts.formatDiagnosticsWithColorAndContext || ts.formatDiagnostics : ts.formatDiagnostics;
  function createTSError(diagnostics) {
    const diagnosticText = formatDiagnostics(diagnostics, diagnosticHost);
    const diagnosticCodes = diagnostics.map((x) => x.code);
    return new TSError(diagnosticText, diagnosticCodes, diagnostics);
  }
  function reportTSError(configDiagnosticList) {
    const error = createTSError(configDiagnosticList);
    if (options.logError) {
      console.error('\x1b[31m%s\x1b[0m', error);
    } else {
      throw error;
    }
  }
  if (configDiagnosticList.length) reportTSError(configDiagnosticList);

  // Transpilation configuration based on target
  const jsxEmitPreserve = config.options.jsx === ts.JsxEmit.Preserve;
  function getEmitExtension(path) {
    const ext = path.slice(path.lastIndexOf('.'));
    switch (ext) {
      case '.js':
      case '.ts':
        return '.js';
      case '.jsx':
      case '.tsx':
        return jsxEmitPreserve ? '.jsx' : '.js';
      case '.mjs':
      case '.mts':
        return '.mjs';
      case '.cjs':
      case '.cts':
        return '.cjs';
      default:
        return '.js';
    }
  }

  // Define TypeScript service brand and registration
  const TS_NODE_SERVICE_BRAND = Symbol('TS_NODE_SERVICE_BRAND');
  let getOutput, getTypeInfo;
  const getCanonicalFileName = ts.createGetCanonicalFileName(ts.sys.useCaseSensitiveFileNames);
  const moduleTypeClassifier = moduleClassifier.createModuleTypeClassifier({
    basePath: options.optionBasePaths?.moduleTypes,
    patterns: options.moduleTypes,
  });
  const extensions = fileExtensions.getExtensions(config, options, ts.version);

  // Main compilation logic
  if (!transpileOnly) {
    const fileContents = new Map();
    const rootFileNames = new Set(config.fileNames);
    const cachedReadFile = utils.cachedLookup(debugFn('readFile', readFile));

    if (!options.compilerHost) {
      let projectVersion = 1;
      const fileVersions = new Map(Array.from(rootFileNames).map((fileName) => [fileName, 0]));
      const getCustomTransformers = () => {
        return typeof transformers === 'function' ? transformers(service.getProgram()) : transformers;
      };

      // Create compiler host for type checking
      const serviceHost = {
        getProjectVersion: () => String(projectVersion),
        getScriptFileNames: () => Array.from(rootFileNames),
        getScriptVersion: (fileName) => (fileVersions.get(fileName) || 0).toString(),
        getScriptSnapshot: (fileName) => {
          let contents = fileContents.get(fileName);
          if (contents === undefined) {
            contents = cachedReadFile(fileName);
            if (contents === undefined) return;
            fileVersions.set(fileName, 1);
            fileContents.set(fileName, contents);
            projectVersion++;
          }
          return ts.ScriptSnapshot.fromString(contents);
        },
        readFile: cachedReadFile,
        readDirectory: ts.sys.readDirectory,
        getDirectories: utils.cachedLookup(debugFn('getDirectories', ts.sys.getDirectories)),
        fileExists: utils.cachedLookup(debugFn('fileExists', fileExists)),
        directoryExists: utils.cachedLookup(debugFn('directoryExists', ts.sys.directoryExists)),
        realpath: ts.sys.realpath ? utils.cachedLookup(debugFn('realpath', ts.sys.realpath)) : undefined,
        getNewLine: () => ts.sys.newLine,
        useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
        getCurrentDirectory: () => cwd,
        getCompilationSettings: () => config.options,
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(config.options),
        getCustomTransformers,
        trace: options.tsTrace,
      };

      const { resolveModuleNames, getResolvedModuleWithFailedLookupLocationsFromCache, resolveTypeReferenceDirectives, isFileKnownToBeInternal, markBucketOfFilenameInternal } = resolver.createResolverFunctions({
        host: serviceHost,
        getCanonicalFileName,
        ts,
        cwd,
        config,
        projectLocalResolveHelper,
        options,
        extensions,
      });

      serviceHost.resolveModuleNames = resolveModuleNames;
      serviceHost.getResolvedModuleWithFailedLookupLocationsFromCache = getResolvedModuleWithFailedLookupLocationsFromCache;
      serviceHost.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;

      const registry = ts.createDocumentRegistry(ts.sys.useCaseSensitiveFileNames, cwd);
      const service = ts.createLanguageService(serviceHost, registry);
      const updateMemoryCache = (contents, fileName) => {
        if (!rootFileNames.has(fileName) && !isFileKnownToBeInternal(fileName)) {
          markBucketOfFilenameInternal(fileName);
          rootFileNames.add(fileName);
          projectVersion++;
        }
        const previousVersion = fileVersions.get(fileName) || 0;
        const previousContents = fileContents.get(fileName);
        if (contents !== previousContents) {
          fileVersions.set(fileName, previousVersion + 1);
          fileContents.set(fileName, contents);
          projectVersion++;
        }
      };

      let previousProgram = undefined;
      getOutput = (code, fileName) => {
        updateMemoryCache(code, fileName);
        const programBefore = service.getProgram();
        if (programBefore !== previousProgram) {
          debug(`compiler rebuilt Program instance when getting output for ${fileName}`);
        }
        const output = service.getEmitOutput(fileName);
        const diagnostics = service.getSemanticDiagnostics(fileName).concat(service.getSyntacticDiagnostics(fileName));
        const programAfter = service.getProgram();
        debug('invariant: Is service.getProgram() identical before and after getting emit output and diagnostics? (should always be true)', programBefore === programAfter);
        previousProgram = programAfter;
        const diagnosticList = filterDiagnostics(diagnostics, diagnosticFilters);
        if (diagnosticList.length) reportTSError(diagnosticList);
        if (output.emitSkipped) {
          return [undefined, undefined, true];
        }
        if (output.outputFiles.length === 0) {
          throw new TypeError(`Unable to require file: ${path.relative(cwd, fileName)}\nThis is usually the result of a faulty configuration or import. Make sure there is a valid file extension with a loader attached before ts-node.`);
        }
        return [output.outputFiles[1].text, output.outputFiles[0].text, false];
      };

      getTypeInfo = (code, fileName, position) => {
        const normalizedFileName = utils.normalizeSlashes(fileName);
        updateMemoryCache(code, normalizedFileName);
        const info = service.getQuickInfoAtPosition(normalizedFileName, position);
        const name = ts.displayPartsToString(info ? info.displayParts : []);
        const comment = ts.displayPartsToString(info ? info.documentation : []);
        return { name, comment };
      };
    }
  }

  const shouldOverwriteEmitWhenForcingCommonJS = config.options.module !== ts.ModuleKind.CommonJS;
  const shouldOverwriteEmitWhenForcingEsm = !(config.options.module === ts.ModuleKind.ES2015 || config.options.module === ts.ModuleKind.ESNext);
  const isNodeModuleType = (ts.ModuleKind.Node16 && config.options.module === ts.ModuleKind.Node16) || (ts.ModuleKind.NodeNext && config.options.module === ts.ModuleKind.NodeNext);
  const getOutputForceCommonJS = createTranspileOnlyGetOutputFunction(ts.ModuleKind.CommonJS);
  const getOutputForceNodeCommonJS = createTranspileOnlyGetOutputFunction(ts.ModuleKind.NodeNext, 'nodecjs');
  const getOutputForceNodeESM = createTranspileOnlyGetOutputFunction(ts.ModuleKind.NodeNext, 'nodeesm');
  const getOutputForceESM = createTranspileOnlyGetOutputFunction(ts.ModuleKind.ESNext);
  const getOutputTranspileOnly = createTranspileOnlyGetOutputFunction();

  function compile(code, fileName, lineOffset = 0) {
    const normalizedFileName = utils.normalizeSlashes(fileName);
    const classification = moduleTypeClassifier.classifyModuleByModuleTypeOverrides(normalizedFileName);
    let value = '';
    let sourceMap = '';
    let emitSkipped = true;
    if (getOutput) [value, sourceMap, emitSkipped] = getOutput(code, normalizedFileName);
    return updateOutput(value, normalizedFileName, sourceMap, getEmitExtension);
  }

  // Handle module registration
  function registerExtensions(preferTsExts, extensions, service, originalHandler) {
    const exts = new Set(extensions);
    for (const cannotAdd of ['.mts', '.cts', '.mjs', '.cjs']) {
      if (exts.has(cannotAdd) && !(utils.hasOwnProperty(require.extensions, cannotAdd))) {
        exts.add('.js');
        exts.delete(cannotAdd);
      }
    }
    for (const ext of exts) {
      registerExtension(ext, service, originalHandler);
    }
    if (preferTsExts) {
      const preferredExtensions = new Set([...exts, ...Object.keys(require.extensions)]);
      for (const ext of preferredExtensions) {
        const old = Object.getOwnPropertyDescriptor(require.extensions, ext);
        delete require.extensions[ext];
        Object.defineProperty(require.extensions, ext, old);
      }
    }
  }

  function registerExtension(ext, service, originalHandler) {
    const old = require.extensions[ext] || originalHandler;
    require.extensions[ext] = function (m, filename) {
      if (service.ignored(filename)) return old(m, filename);
      assertScriptCanLoadAsCJS(service, m, filename);
      const _compile = m._compile;
      m._compile = function (code, fileName) {
        debug('module._compile', fileName);
        const result = service.compile(code, fileName);
        return _compile.call(this, result, fileName);
      };
      return old(m, filename);
    };
  }

  function updateOutput(outputText, fileName, sourceMap, getEmitExtension) {
    const base64Map = Buffer.from(updateSourceMap(sourceMap, fileName), 'utf8').toString('base64');
    const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`;
    const prefix = '//# sourceMappingURL=';
    const prefixLength = prefix.length;
    const baseName = path.basename(fileName);
    const extName = path.extname(fileName);
    const extension = getEmitExtension(fileName);
    const sourcemapFilename = baseName.slice(0, -extName.length) + extension + '.map';
    const sourceMapLengthWithoutPercentEncoding = prefixLength + sourcemapFilename.length;
    if (outputText.substr(-sourceMapLengthWithoutPercentEncoding, prefixLength) === prefix) {
      return outputText.slice(0, -sourceMapLengthWithoutPercentEncoding) + sourceMapContent;
    }
    const sourceMapLengthWithPercentEncoding = prefixLength + encodeURI(sourcemapFilename).length;
    if (outputText.substr(-sourceMapLengthWithPercentEncoding, prefixLength) === prefix) {
      return outputText.slice(0, -sourceMapLengthWithPercentEncoding) + sourceMapContent;
    }
    return `${outputText}\n${sourceMapContent}`;
  }

  // Update source map contents
  function updateSourceMap(sourceMapText, fileName) {
    const sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = fileName;
    sourceMap.sources = [fileName];
    delete sourceMap.sourceRoot;
    return JSON.stringify(sourceMap);
  }

  return {
    [TS_NODE_SERVICE_BRAND]: true,
    ts,
    compilerPath: compiler,
    config,
    compile,
    getTypeInfo,
    ignored: (fileName) => true,
    enabled: (enabled) => !!enabled,
    options,
    configFilePath,
    moduleTypeClassifier,
    shouldReplAwait,
    addDiagnosticFilter: (filter) => { },
    installSourceMapSupport,
    enableExperimentalEsmLoaderInterop,
    transpileOnly,
    projectLocalResolveHelper,
    getNodeEsmResolver: utils.once(() => require('../dist-raw/node-internal-modules-esm-resolve').createResolve({ extensions, preferTsExts: options.preferTsExts, tsNodeExperimentalSpecifierResolution: options.experimentalSpecifierResolution })),
    getNodeEsmGetFormat: utils.once(() => require('../dist-raw/node-internal-modules-esm-get_format').createGetFormat(options.experimentalSpecifierResolution, getNodeEsmResolver())),
    getNodeCjsLoader: utils.once(() => require('../dist-raw/node-internal-modules-cjs-loader').createCjsLoader({ extensions, preferTsExts: options.preferTsExts, nodeEsmResolver: getNodeEsmResolver() })),
    extensions,
  };
}

// Export the main functions
export {
  createRepl,
  register,
  create,
  createFromPreloadedConfig,
  createEsmHooks
};
