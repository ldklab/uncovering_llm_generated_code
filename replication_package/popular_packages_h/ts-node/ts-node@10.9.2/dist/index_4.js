"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("util");
const url = require("url");
const makeError = require("make-error");
const { yn, parse, split, createProjectLocalResolveHelper, normalizeSlashes, once } = require("./util");
const { findAndReadConfig, loadCompiler } = require("./configuration");
const { createNodeModuleClassifier } = require("./module-type-classifier");
const { createResolverFunctions } = require("./resolver-functions");
const { installCommonjsResolveHooksIfNecessary } = require("./cjs-resolve-hooks");
const { getExtensions } = require("./file-extensions");
const { createTsTranspileModule } = require("./ts-transpile-module");
const { createRepl } = require("./repl");

exports.REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');
exports.env = process.env;
exports.INSPECT_CUSTOM = util.inspect.custom || 'inspect';
exports.VERSION = require('../package.json').version;

class TSError extends makeError.BaseError {
  constructor(diagnosticText, diagnosticCodes, diagnostics = []) {
    super(`⨯ Unable to compile TypeScript:\n${diagnosticText}`);
    this.diagnosticCodes = diagnosticCodes;
    this.name = 'TSError';
    this.diagnosticText = diagnosticText;
    this.diagnostics = diagnostics;
  }

  [exports.INSPECT_CUSTOM]() {
    return this.diagnosticText;
  }
}

function register(serviceOrOpts) {
  let service = serviceOrOpts;
  if (!serviceOrOpts?.[TS_NODE_SERVICE_BRAND]) {
    service = create((serviceOrOpts || {}));
  }
  const originalJsHandler = require.extensions['.js'];
  process[exports.REGISTER_INSTANCE] = service;
  registerExtensions(service.options.preferTsExts, service.extensions.compiled, service, originalJsHandler);
  installCommonjsResolveHooksIfNecessary(service);
  require.extensions['.js'].apply(this, arguments);
  return service;
}

function create(rawOptions = {}) {
  const foundConfigResult = findAndReadConfig(rawOptions);
  return createFromPreloadedConfig(foundConfigResult);
}

function createFromPreloadedConfig(foundConfigResult) {
  const { options, config, projectLocalResolveDir } = foundConfigResult;
  const projectLocalResolveHelper = createProjectLocalResolveHelper(projectLocalResolveDir);
  const ts = loadCompiler(config.compiler);
  const targetSupportsTla = config.options.target >= ts.ScriptTarget.ES2018;
  const tsVersionSupportsTla = versionGteLt(ts.version, '3.8.0');

  if (options.experimentalReplAwait === true && (!targetSupportsTla || !tsVersionSupportsTla)) {
    throw new Error('Experimental REPL await is incompatible with current target.');
  }

  const shouldReplAwait = options.experimentalReplAwait !== false && tsVersionSupportsTla && targetSupportsTla;
  const readFile = options.readFile || ts.sys.readFile;
  const fileExists = options.fileExists || ts.sys.fileExists;
  const transpileOnly = (options.transpileOnly === true || options.swc === true) && options.typeCheck !== true;

  const compile = transpileOnly ? createTranspilerFunction() : undefined;
  const getTypeInfo = transpileOnly ? undefined : createTypeInfoFunction();

  return getServiceObject();

  function createTranspilerFunction() {
    // Logic to create transpileonly function
  }

  function createTypeInfoFunction() {
    // Logic to create getTypeInfo function
  }

  function getServiceObject() {
    return {
      compile,
      getTypeInfo,
      ts,
      options,
      shouldReplAwait,
      addDiagnosticFilter,
      installSourceMapSupport,
      enableExperimentalEsmLoaderInterop,
      transpileOnly,
      projectLocalResolveHelper,
      extensions,
    };
  }

  function installSourceMapSupport() {
    const sourceMapSupport = require('@cspotcode/source-map-support');
    sourceMapSupport.install({
      environment: 'node',
      retrieveFile(pathOrUrl) {
        let path = (pathOrUrl.startsWith('file://')) ? url.fileURLToPath(pathOrUrl) : pathOrUrl;
        path = normalizeSlashes(path);
        return outputCache.get(path)?.content || '';
      },
      redirectConflictingLibrary: true,
    });
  }

  function addDiagnosticFilter(filter) {
    diagnosticFilters.push({
      ...filter,
      filenamesAbsolute: filter.filenamesAbsolute.map((f) => normalizeSlashes(f)),
    });
  }

  function enableExperimentalEsmLoaderInterop() {
    experimentalEsmLoader = true;
  }
}

function registerExtensions(preferTsExts, extensions, service, originalJsHandler) {
  const exts = new Set(extensions);
  for (const ext of exts) {
    registerExtension(ext, service, originalJsHandler);
  }
}

function registerExtension(ext, service, originalHandler) {
  const old = require.extensions[ext] || originalHandler;
  require.extensions[ext] = function (m, filename) {
    if (service.ignored(filename)) return old(m, filename);
    assertScriptCanLoadAsCJS(service, m, filename);
    const _compile = m._compile;
    m._compile = function (code, fileName) {
      const result = service.compile(code, fileName);
      return _compile.call(this, result, fileName);
    };
    return old(m, filename);
  };
}

const createEsmHooks = (tsNodeService) => require('./esm').createEsmHooks(tsNodeService);
exports.createEsmHooks = createEsmHooks;
