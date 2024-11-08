typescript
"use strict";
import { dirname, basename, extname, join, relative } from "path";
import { Module } from "module";
import * as util from "util";
import { fileURLToPath } from "url";
import { BaseError } from "make-error";
import { yn, split, parse, normalizeSlashes, createProjectLocalResolveHelper, versionGteLt, hasOwnProperty, cachedLookup, once } from "./util";
import { findAndReadConfig, loadCompiler } from "./configuration";
import { createModuleTypeClassifier } from "./module-type-classifier";
import { createResolverFunctions } from "./resolver-functions";
import { installCommonjsResolveHooksIfNecessary } from "./cjs-resolve-hooks";
import { classifyModule } from "./node-module-type-classifier";
import { getExtensions } from "./file-extensions";
import { createTsTranspileModule } from "./ts-transpile-module";
import { createRepl } from "./repl";

const engineSupportsPackageTypeField = parseInt(process.versions.node.split('.')[0], 10) >= 12;
let assertScriptCanLoadAsCJS = engineSupportsPackageTypeField
    ? require('../dist-raw/node-internal-modules-cjs-loader').assertScriptCanLoadAsCJSImpl
    : () => { /* noop */ };

export const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');
export const env = process.env;
export const INSPECT_CUSTOM = util.inspect.custom || 'inspect';
const shouldDebug = yn(env.TS_NODE_DEBUG);

export const debug = shouldDebug
    ? (...args) => console.log(`[ts-node ${new Date().toISOString()}]`, ...args)
    : () => undefined;

const debugFn = shouldDebug
    ? (key, fn) => {
        let i = 0;
        return (x) => {
            debug(key, x, ++i);
            return fn(x);
        };
    }
    : (_, fn) => fn;

export const VERSION = require('../package.json').version;

export const DEFAULTS = {
    cwd: env.TS_NODE_CWD ?? env.TS_NODE_DIR,
    emit: yn(env.TS_NODE_EMIT),
    scope: yn(env.TS_NODE_SCOPE),
    scopeDir: env.TS_NODE_SCOPE_DIR,
    files: yn(env.TS_NODE_FILES),
    pretty: yn(env.TS_NODE_PRETTY),
    compiler: env.TS_NODE_COMPILER,
    compilerOptions: parse(env.TS_NODE_COMPILER_OPTIONS),
    ignore: split(env.TS_NODE_IGNORE),
    project: env.TS_NODE_PROJECT,
    skipProject: yn(env.TS_NODE_SKIP_PROJECT),
    skipIgnore: yn(env.TS_NODE_SKIP_IGNORE),
    preferTsExts: yn(env.TS_NODE_PREFER_TS_EXTS),
    ignoreDiagnostics: split(env.TS_NODE_IGNORE_DIAGNOSTICS),
    transpileOnly: yn(env.TS_NODE_TRANSPILE_ONLY),
    typeCheck: yn(env.TS_NODE_TYPE_CHECK),
    compilerHost: yn(env.TS_NODE_COMPILER_HOST),
    logError: yn(env.TS_NODE_LOG_ERROR),
    experimentalReplAwait: yn(env.TS_NODE_EXPERIMENTAL_REPL_AWAIT) ?? undefined,
    tsTrace: console.log.bind(console),
};

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

function register(serviceOrOpts) {
    let service = serviceOrOpts;
    if (!(serviceOrOpts?.[REGISTER_INSTANCE])) {
        service = create(serviceOrOpts ?? {});
    }
    const originalJsHandler = require.extensions['.js'];
    process[REGISTER_INSTANCE] = service;
    registerExtensions(service.options.preferTsExts, service.extensions.compiled, service, originalJsHandler);
    installCommonjsResolveHooksIfNecessary(service);
    Module._preloadModules(service.options.require);
    return service;
}

function create(rawOptions = {}) {
    const foundConfigResult = findAndReadConfig(rawOptions);
    return createFromPreloadedConfig(foundConfigResult);
}

function createFromPreloadedConfig(foundConfigResult) {
    const { configFilePath, cwd, options, config, compiler, projectLocalResolveDir, optionBasePaths } = foundConfigResult;
    const projectLocalResolveHelper = createProjectLocalResolveHelper(projectLocalResolveDir);
    const ts = loadCompiler(compiler);

    const targetSupportsTla = config.options.target >= ts.ScriptTarget.ES2018;
    if (options.experimentalReplAwait && !targetSupportsTla) {
        throw new Error('Experimental REPL await is not compatible with targets lower than ES2018');
    }

    const tsVersionSupportsTla = versionGteLt(ts.version, '3.8.0');
    if (options.experimentalReplAwait && !tsVersionSupportsTla) {
        throw new Error('Experimental REPL await is not compatible with TypeScript versions older than 3.8');
    }

    const shouldReplAwait = options.experimentalReplAwait !== false && tsVersionSupportsTla && targetSupportsTla;

    if (options.swc && !options.typeCheck) {
        if (options.transpileOnly === false) {
            throw new Error("Cannot enable 'swc' option with 'transpileOnly: false'. 'swc' implies 'transpileOnly'.");
        }
        if (options.transpiler) {
            throw new Error("Cannot specify both 'swc' and 'transpiler' options. 'swc' uses the built-in swc transpiler.");
        }
    }

    const readFile = options.readFile || ts.sys.readFile;
    const fileExists = options.fileExists || ts.sys.fileExists;
    const transpileOnly = (options.transpileOnly === true || options.swc === true) && options.typeCheck !== true;
    
    let transpiler, transpilerBasePath;
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
            ...(options.ignoreDiagnostics || [])
        ].map(Number),
    }];

    const configDiagnosticList = filterDiagnostics(config.errors, diagnosticFilters);

    const outputCache = new Map();
    const configFileDirname = configFilePath ? dirname(configFilePath) : null;
    const scopeDir = options.scopeDir ?? config.options.rootDir ?? configFileDirname ?? cwd;
    const ignoreBaseDir = configFileDirname ?? cwd;

    const isScoped = options.scope ? (fileName) => relative(scopeDir, fileName).charAt(0) !== '.' : () => true;
    const shouldIgnore = createIgnore(ignoreBaseDir, options.skipIgnore ? [] : (options.ignore || ['(?:^|/)node_modules/']).map((str) => new RegExp(str)));

    const diagnosticHost = {
        getNewLine: () => ts.sys.newLine,
        getCurrentDirectory: () => cwd,
        getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? (x) => x : (x) => x.toLowerCase(),
    };

    if (options.transpileOnly && typeof transformers === 'function') {
        throw new TypeError('Transformers function is unavailable in "--transpile-only"');
    }

    let createTranspiler = initializeTranspilerFactory();
    
    function initializeTranspilerFactory() {
        if (transpiler) {
            if (!transpileOnly) throw new Error('Custom transpiler can only be used when transpileOnly is enabled.');
            const transpilerName = typeof transpiler === 'string' ? transpiler : transpiler[0];
            const transpilerOptions = typeof transpiler === 'string' ? {} : transpiler[1] ?? {};
            const transpilerConfigLocalResolveHelper = transpilerBasePath
                ? createProjectLocalResolveHelper(transpilerBasePath)
                : projectLocalResolveHelper;
            const transpilerPath = transpilerConfigLocalResolveHelper(transpilerName, true);
            const transpilerFactory = require(transpilerPath).create;

            return createTranspiler;

            function createTranspiler(compilerOptions, nodeModuleEmitKind) {
                return transpilerFactory?.({
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

    let experimentalEsmLoader = false;

    function enableExperimentalEsmLoaderInterop() {
        experimentalEsmLoader = true;
    }

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
                    } catch (e) {
                        /* swallow error */
                    }
                }

                path = normalizeSlashes(path);
                return outputCache.get(path)?.content || '';
            },
            redirectConflictingLibrary: true,
            onConflictingLibraryRedirect(request, parent, isMain, options, redirectedRequest) {
                debug(`Redirected an attempt to require source-map-support to instead receive @cspotcode/source-map-support. "${parent.filename}" attempted to require or resolve "${request}" and was redirected to "${redirectedRequest}".`);
            },
        });
    }

    const shouldHavePrettyErrors = options.pretty === undefined ? process.stdout.isTTY : options.pretty;
    const formatDiagnostics = shouldHavePrettyErrors
        ? ts.formatDiagnosticsWithColorAndContext || ts.formatDiagnostics
        : ts.formatDiagnostics;

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

    const jsxEmitPreserve = config.options.jsx === ts.JsxEmit.Preserve;

    function getEmitExtension(path) {
        const lastDotIndex = path.lastIndexOf('.');
        if (lastDotIndex >= 0) {
            const ext = path.slice(lastDotIndex);
            switch (ext) {
                case '.js':
                case '.ts': return '.js';
                case '.jsx':
                case '.tsx': return jsxEmitPreserve ? '.jsx' : '.js';
                case '.mjs':
                case '.mts': return '.mjs';
                case '.cjs':
                case '.cts': return '.cjs';
            }
        }
        return '.js';
    }

    let getOutput, getTypeInfo;

    const getCanonicalFileName = ts.createGetCanonicalFileName(ts.sys.useCaseSensitiveFileNames);
    const moduleTypeClassifier = createModuleTypeClassifier({ basePath: optionBasePaths?.moduleTypes, patterns: options.moduleTypes });
    const extensions = getExtensions(config, options, ts.version);

    if (!transpileOnly) {
        const fileContents = new Map();
        const rootFileNames = new Set(config.fileNames);
        const cachedReadFile = cachedLookup(debugFn('readFile', readFile));

        if (!options.compilerHost) {
            let projectVersion = 1;
            const fileVersions = new Map(Array.from(rootFileNames).map((fileName) => [fileName, 0]));

            const getCustomTransformers = () => {
                if (typeof transformers === 'function') {
                    const program = service.getProgram();
                    return program ? transformers(program) : undefined;
                }
                return transformers;
            };

            const serviceHost = {
                getProjectVersion: () => String(projectVersion),
                getScriptFileNames: () => Array.from(rootFileNames),
                getScriptVersion: (fileName) => {
                    const version = fileVersions.get(fileName);
                    return version ? version.toString() : '';
                },
                getScriptSnapshot(fileName) {
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
                getDirectories: cachedLookup(debugFn('getDirectories', ts.sys.getDirectories)),
                fileExists: cachedLookup(debugFn('fileExists', fileExists)),
                directoryExists: cachedLookup(debugFn('directoryExists', ts.sys.directoryExists)),
                realpath: ts.sys.realpath ? cachedLookup(debugFn('realpath', ts.sys.realpath)) : undefined,
                getNewLine: () => ts.sys.newLine,
                useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
                getCurrentDirectory: () => cwd,
                getCompilationSettings: () => config.options,
                getDefaultLibFileName: () => ts.getDefaultLibFilePath(config.options),
                getCustomTransformers: getCustomTransformers,
                trace: options.tsTrace,
            };

            const { resolveModuleNames, getResolvedModuleWithFailedLookupLocationsFromCache, resolveTypeReferenceDirectives, isFileKnownToBeInternal, markBucketOfFilenameInternal } = createResolverFunctions({
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

            let previousProgram;

            getOutput = (code, fileName) => {
                updateMemoryCache(code, fileName);
                const programBefore = service.getProgram();
                if (programBefore !== previousProgram) {
                    debug(`compiler rebuilt Program instance when getting output for ${fileName}`);
                }
                const output = service.getEmitOutput(fileName);

                const diagnostics = service.getSemanticDiagnostics(fileName).concat(service.getSyntacticDiagnostics(fileName));
                const programAfter = service.getProgram();
                debug('invariant: Is service.getProject() identical before and after getting emit output and diagnostics? (should always be true) ', programBefore === programAfter);
                previousProgram = programAfter;

                const diagnosticList = filterDiagnostics(diagnostics, diagnosticFilters);
                if(diagnosticList.length) reportTSError(diagnosticList);

                if (output.emitSkipped) {
                    return [undefined, undefined, true];
                }

                if (output.outputFiles.length === 0) {
                    throw new TypeError(`Unable to require file: ${(0, path_1.relative)(cwd, fileName)}\n` +
                                        'This is usually the result of a faulty configuration or import. ' + 
                                        'Make sure there is a `.js`, `.json` or other executable extension with ' +
                                        'loader attached before `ts-node` available.');
                }
                return [output.outputFiles[1].text, output.outputFiles[0].text, false];
            };

            getTypeInfo = (code, fileName, position) => {
                const fileNameNormalized = normalizeSlashes(fileName);
                updateMemoryCache(code, fileNameNormalized);

                const info = service.getQuickInfoAtPosition(fileNameNormalized, position);
                const name = ts.displayPartsToString(info ? info.displayParts : []);
                const comment = ts.displayPartsToString(info ? info.documentation : []);
                return { name, comment };
            };
        }
        else {
            const sys = {
                ...ts.sys,
                ...diagnosticHost,
                readFile: (fileName) => {
                    const cacheContents = fileContents.get(fileName);
                    if (cacheContents !== undefined) return cacheContents;
                    const contents = cachedReadFile(fileName);
                    if(contents) fileContents.set(fileName, contents);
                    return contents;
                },
                readDirectory: ts.sys.readDirectory,
                getDirectories: cachedLookup(debugFn('getDirectories', ts.sys.getDirectories)),
                fileExists: cachedLookup(debugFn('fileExists', fileExists)),
                directoryExists: cachedLookup(debugFn('directoryExists', ts.sys.directoryExists)),
                resolvePath: cachedLookup(debugFn('resolvePath', ts.sys.resolvePath)),
                realpath: ts.sys.realpath ? cachedLookup(debugFn('realpath', ts.sys.realpath)) : undefined,
            };

            const host = ts.createIncrementalCompilerHost
                ? ts.createIncrementalCompilerHost(config.options, sys)
                : {
                    ...sys,
                    getSourceFile: (fileName, languageVersion) => {
                        const contents = sys.readFile(fileName);
                        if (contents === undefined) return;
                        return ts.createSourceFile(fileName, contents, languageVersion);
                    },
                    getDefaultLibLocation: () => normalizeSlashes( dirname(compiler)),
                    getDefaultLibFileName: () => normalizeSlashes(join( dirname(compiler), ts.getDefaultLibFileName(config.options))),
                    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
                };

            host.trace = options.tsTrace;

            const { resolveModuleNames, resolveTypeReferenceDirectives, isFileKnownToBeInternal, markBucketOfFilenameInternal } = createResolverFunctions({
                host,
                cwd,
                config,
                ts,
                getCanonicalFileName,
                projectLocalResolveHelper,
                options,
                extensions,
            });

            host.resolveModuleNames = resolveModuleNames;
            host.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;

            let builderProgram = ts.createIncrementalProgram
                ? ts.createIncrementalProgram({
                    rootNames: Array.from(rootFileNames),
                    options: config.options,
                    host,
                    configFileParsingDiagnostics: config.errors,
                    projectReferences: config.projectReferences,
                })
                : ts.createEmitAndSemanticDiagnosticsBuilderProgram(Array.from(rootFileNames), config.options, host, undefined, config.errors, config.projectReferences);

            const customTransformers = typeof transformers === 'function'
                ? transformers(builderProgram.getProgram())
                : transformers;

            const updateMemoryCache = (contents, fileName) => {
                const previousContents = fileContents.get(fileName);
                const contentsChanged = previousContents !== contents;
                if(contentsChanged) {
                    fileContents.set(fileName, contents);
                }

                let addedToRootFileNames = false;
                if (!rootFileNames.has(fileName) && !isFileKnownToBeInternal(fileName)) {
                    markBucketOfFilenameInternal(fileName);
                    rootFileNames.add(fileName);
                    addedToRootFileNames = true;
                }

                if (addedToRootFileNames || contentsChanged) {
                    builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(Array.from(rootFileNames), config.options, host, builderProgram, config.errors, config.projectReferences);
                }
            };

            getOutput = (code, fileName) => {
                let outText = '',
                    outMap = '';
                updateMemoryCache(code, fileName);
                const sourceFile = builderProgram.getSourceFile(fileName);
                if (!sourceFile) throw new TypeError(`Unable to read file: ${fileName}`);

                const program = builderProgram.getProgram();
                const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
                const diagnosticList = filterDiagnostics(diagnostics, diagnosticFilters);
                if(diagnosticList.length) reportTSError(diagnosticList);

                const result = builderProgram.emit(sourceFile, (path, file, writeByteOrderMark) => {
                    if (path.endsWith('.map')) {
                        outMap = file;
                    } else {
                        outText = file;
                    }
                    if (options.emit) sys.writeFile(path, file, writeByteOrderMark);
                }, undefined, undefined, customTransformers);

                if (result.emitSkipped) {
                    return [undefined, undefined, true];
                }

                if (outText === '') {
                    if (program.isSourceFileFromExternalLibrary(sourceFile)) {
                        throw new TypeError(`Unable to compile file from external library: ${relative(cwd, fileName)}`);
                    }
                    throw new TypeError(`Unable to require file: ${relative(cwd, fileName)}\n` +
                        'This is usually the result of a faulty configuration or import. ' + 
                        'Make sure there is a `.js`, `.json` or other executable extension with ' +
                        'loader attached before `ts-node` available.');
                }

                return [outText, outMap, false];
            };

            getTypeInfo = (code, fileName, position) => {
                const fileNameNormalized = normalizeSlashes(fileName);
                updateMemoryCache(code, fileNameNormalized);

                const sourceFile = builderProgram.getSourceFile(fileNameNormalized);
                if (!sourceFile) throw new TypeError(`Unable to read file: ${fileName}`);

                const node = getTokenAtPosition(ts, sourceFile, position);
                const checker = builderProgram.getProgram().getTypeChecker();
                const symbol = checker.getSymbolAtLocation(node);
                if (!symbol) return { name: '', comment: '' };
                const type = checker.getTypeOfSymbolAtLocation(symbol, node);
                const signatures = [...type.getConstructSignatures(), ...type.getCallSignatures()];

                return {
                    name: signatures.length ? signatures.map((x) => checker.signatureToString(x)).join('\n') : checker.typeToString(type),
                    comment: ts.displayPartsToString(symbol ? symbol.getDocumentationComment(checker) : []),
                };
            };

            if (options.emit && config.options.incremental) {
                process.on('exit', () => {
                    builderProgram.getProgram().emitBuildInfo();
                });
            }
        }
    }
    else {
        getTypeInfo = () => {
            throw new TypeError('Type information is unavailable in "--transpile-only"');
        };
    }

    function createTranspileOnlyGetOutputFunction(overrideModuleType, nodeModuleEmitKind) {
        const compilerOptions = { ...config.options };
        if (overrideModuleType !== undefined) compilerOptions.module = overrideModuleType;

        const customTranspiler = createTranspiler?.(compilerOptions, nodeModuleEmitKind);
        const tsTranspileModule = versionGteLt(ts.version, '4.7.0') ? createTsTranspileModule(ts, { compilerOptions, reportDiagnostics: true, transformers }) : undefined;

        return (code, fileName) => {
            let result;

            if (customTranspiler) {
                result = customTranspiler.transpile(code, { fileName });
            } else if (tsTranspileModule) {
                result = tsTranspileModule(code, { fileName }, nodeModuleEmitKind === 'nodeesm' ? 'module' : 'commonjs');
            } else {
                result = ts.transpileModule(code, { fileName, compilerOptions, reportDiagnostics: true, transformers });
            }

            const diagnosticList = filterDiagnostics(result.diagnostics || [], diagnosticFilters);
            if(diagnosticList.length) reportTSError(diagnosticList);

            return [result.outputText, result.sourceMapText, false];
        };
    }

    const shouldOverwriteEmitWhenForcingCommonJS = config.options.module !== ts.ModuleKind.CommonJS;

    const shouldOverwriteEmitWhenForcingEsm = !(config.options.module === ts.ModuleKind.ES2015 || 
        (ts.ModuleKind.ES2020 && config.options.module === ts.ModuleKind.ES2020) || 
        (ts.ModuleKind.ES2022 && config.options.module === ts.ModuleKind.ES2022) ||
        config.options.module === ts.ModuleKind.ESNext);

    const isNodeModuleType = (ts.ModuleKind.Node16 && config.options.module === ts.ModuleKind.Node16) ||
        (ts.ModuleKind.NodeNext && config.options.module === ts.ModuleKind.NodeNext);

    const getOutputForceCommonJS = createTranspileOnlyGetOutputFunction(ts.ModuleKind.CommonJS);
    const getOutputForceNodeCommonJS = createTranspileOnlyGetOutputFunction(ts.ModuleKind.NodeNext, 'nodecjs');
    const getOutputForceNodeESM = createTranspileOnlyGetOutputFunction(ts.ModuleKind.NodeNext, 'nodeesm');
    const getOutputForceESM = createTranspileOnlyGetOutputFunction(ts.ModuleKind.ES2022 || ts.ModuleKind.ES2020 || ts.ModuleKind.ES2015);
    const getOutputTranspileOnly = createTranspileOnlyGetOutputFunction();

    function compile(code, fileName, lineOffset = 0) {
        const normalizedFileName = normalizeSlashes(fileName);
        const classification = moduleTypeClassifier.classifyModuleByModuleTypeOverrides(normalizedFileName);
        let value = '', sourceMap = '', emitSkipped = true;

        if (getOutput) {
            [value, sourceMap, emitSkipped] = getOutput(code, normalizedFileName);
        }

        if (classification.moduleType === 'cjs' && 
            (shouldOverwriteEmitWhenForcingCommonJS || emitSkipped)) {
            [value, sourceMap] = getOutputForceCommonJS(code, normalizedFileName);
        } else if (classification.moduleType === 'esm' && 
            (shouldOverwriteEmitWhenForcingEsm || emitSkipped)) {
            [value, sourceMap] = getOutputForceESM(code, normalizedFileName);
        } else if (emitSkipped) {
            const classification = classifyModule(fileName, isNodeModuleType);
            [value, sourceMap] = 
                classification === 'nodecjs'
                    ? getOutputForceNodeCommonJS(code, normalizedFileName)
                    : classification === 'nodeesm'
                        ? getOutputForceNodeESM(code, normalizedFileName)
                        : classification === 'cjs'
                            ? getOutputForceCommonJS(code, normalizedFileName)
                            : classification === 'esm'
                                ? getOutputForceESM(code, normalizedFileName)
                                : getOutputTranspileOnly(code, normalizedFileName);
        }
        const output = updateOutput(value, normalizedFileName, sourceMap, getEmitExtension);
        outputCache.set(normalizedFileName, { content: output });
        return output;
    }

    let active = true;
    const enabled = (enabled) => enabled === undefined ? active : (active = !!enabled);
    const ignored = (fileName) => {
        if (!active) return true;
        const ext = extname(fileName);
        if (extensions.compiled.includes(ext)) {
            return !isScoped(fileName) || shouldIgnore(fileName);
        }
        return true;
    };

    function addDiagnosticFilter(filter) {
        diagnosticFilters.push({
            ...filter,
            filenamesAbsolute: filter.filenamesAbsolute.map((f) => normalizeSlashes(f)),
        });
    }

    const getNodeEsmResolver = once(() => require('../dist-raw/node-internal-modules-esm-resolve').createResolve({ 
        extensions,
        preferTsExts: options.preferTsExts,
        tsNodeExperimentalSpecifierResolution: options.experimentalSpecifierResolution,
    }));

    const getNodeEsmGetFormat = once(() => require('../dist-raw/node-internal-modules-esm-get_format').createGetFormat(options.experimentalSpecifierResolution, getNodeEsmResolver()));

    const getNodeCjsLoader = once(() => require('../dist-raw/node-internal-modules-cjs-loader').createCjsLoader({
        extensions,
        preferTsExts: options.preferTsExts,
        nodeEsmResolver: getNodeEsmResolver(),
    }));

    return {
        [TS_NODE_SERVICE_BRAND]: true,
        ts,
        compilerPath: compiler,
        config,
        compile,
        getTypeInfo,
        ignored,
        enabled,
        options,
        configFilePath,
        moduleTypeClassifier,
        shouldReplAwait,
        addDiagnosticFilter,
        installSourceMapSupport,
        enableExperimentalEsmLoaderInterop,
        transpileOnly,
        projectLocalResolveHelper,
        getNodeEsmResolver,
        getNodeEsmGetFormat,
        getNodeCjsLoader,
        extensions,
    };
}

function createIgnore(ignoreBaseDir, ignore) {
    return (fileName) => {
        const relname = relative(ignoreBaseDir, fileName);
        const path = normalizeSlashes(relname);
        return ignore.some((x) => x.test(path));
    };
}

function registerExtensions(preferTsExts, extensions, service, originalJsHandler) {
    const exts = new Set(extensions);

    for (const cannotAdd of ['.mts', '.cts', '.mjs', '.cjs']) {
        if (exts.has(cannotAdd) && !hasOwnProperty(require.extensions, cannotAdd)) {
            exts.add('.js');
            exts.delete(cannotAdd);
        }
    }

    for (const ext of exts) {
        registerExtension(ext, service, originalJsHandler);
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
    const baseName = basename(fileName);
    const extName = extname(fileName);
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

function updateSourceMap(sourceMapText, fileName) {
    const sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = fileName;
    sourceMap.sources = [fileName];
    delete sourceMap.sourceRoot;
    return JSON.stringify(sourceMap);
}

function filterDiagnostics(diagnostics, filters) {
    return diagnostics.filter((d) => filters.every((f) => {
        const filenamesAbsolute = f.filenamesAbsolute.includes(d.file?.fileName);
        const diagnosticsIgnored = f.diagnosticsIgnored.includes(d.code);
        return !filenamesAbsolute || !diagnosticsIgnored;
    }));
}

function getTokenAtPosition(ts, sourceFile, position) {
    let current = sourceFile;
    outer: while (true) {
        for (const child of current.getChildren(sourceFile)) {
            const start = child.getFullStart();
            if (start > position) break;
            const end = child.getEnd();
            if (position <= end) {
                current = child;
                continue outer;
            }
        }
        return current;
    }
}

const createEsmHooks = (tsNodeService) => require('./esm').createEsmHooks(tsNodeService);
