"use strict";

// Module imports
const path = require("path");
const sourceMapSupport = require("source-map-support");
const yn = require("yn");
const { BaseError } = require("make-error");
const util = require("util");
const url = require("url");
const { createRequire: nodeCreateRequire } = require("module");
const { resolve, dirname, basename, extname, join } = path;
const createRequire = nodeCreateRequire || require('create-require');
const { createRepl } = require("./repl");

// Exported items
exports.create = create;
exports.register = register;
exports.getExtensions = getExtensions;
exports.TSError = TSError;
exports.normalizeSlashes = normalizeSlashes;
exports.parse = parse;
exports.split = split;
exports.DEFAULTS = DEFAULTS;
exports.VERSION = require('../package.json').version;
exports.debug = debug;
exports.INSPECT_CUSTOM = util.inspect.custom || 'inspect';
exports.REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');

// Constants for Node.js compatibility
const engineSupportsPackageTypeField = parseInt(process.versions.node.split('.')[0], 10) >= 12;

// Environment-dependent debug function
function yn(value) {
    return ynModule(value) || undefined;
}

const shouldDebug = yn(process.env.TS_NODE_DEBUG);
function debug(...args) {
    if (shouldDebug) {
        console.log(`[ts-node ${new Date().toISOString()}]`, ...args);
    }
}

function debugFn(key, fn) {
    if (!shouldDebug) return fn;
    let i = 0;
    return (x) => {
        debug(key, x, ++i);
        return fn(x);
    };
}

// Utility functions
function split(value) {
    return typeof value === 'string' ? value.split(/ *, */g) : undefined;
}

function parse(value) {
    return typeof value === 'string' ? JSON.parse(value) : undefined;
}

function normalizeSlashes(value) {
    return value.replace(/\\/g, '/');
}

// Defaults
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

// TypeScript options
const TS_NODE_COMPILER_OPTIONS = {
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: true,
    declaration: false,
    noEmit: false,
    outDir: '.ts-node'
};

// Custom error class for TypeScript diagnostics
class TSError extends BaseError {
    constructor(diagnosticText, diagnosticCodes) {
        super(`⨯ Unable to compile TypeScript:\n${diagnosticText}`);
        this.diagnosticText = diagnosticText;
        this.diagnosticCodes = diagnosticCodes;
        this.name = 'TSError';
    }

    [exports.INSPECT_CUSTOM]() {
        return this.diagnosticText;
    }
}

// Register and create functions
function register(opts = {}) {
    const originalJsHandler = require.extensions['.js'];
    const service = create(opts);
    const { tsExtensions, jsExtensions } = getExtensions(service.config);
    const extensions = [...tsExtensions, ...jsExtensions];
    process[exports.REGISTER_INSTANCE] = service;
    registerExtensions(service.options.preferTsExts, extensions, service, originalJsHandler);
    Module._preloadModules(service.options.require);
    return service;
}

function create(rawOptions = {}) {
    const dir = rawOptions.dir || DEFAULTS.dir;
    const compilerName = rawOptions.compiler || DEFAULTS.compiler;
    const cwd = dir ? resolve(dir) : process.cwd();

    const { compiler, ts } = loadCompiler(compilerName);
    const { config, options: tsconfigOptions } = readConfig(cwd, ts, rawOptions);
    const options = Object.assign({}, DEFAULTS, tsconfigOptions, rawOptions);
    
    options.require = [ ...tsconfigOptions.require || [], ...rawOptions.require || [] ];

    const readFile = options.readFile || ts.sys.readFile;
    const fileExists = options.fileExists || ts.sys.fileExists;
    const transpileOnly = options.transpileOnly && !options.typeCheck;
    const transformers = options.transformers || undefined;
    const ignoreDiagnostics = [6059, 18002, 18003, ...(options.ignoreDiagnostics || [])].map(Number);
    const configDiagnosticList = filterDiagnostics(config.errors, ignoreDiagnostics);
    
    const outputCache = new Map();
    const isScoped = options.scope ? relname => relname.charAt(0) !== '.' : () => true;
    const shouldIgnore = createIgnore(options.skipIgnore ? [] : options.ignore.map(str => new RegExp(str)));
    const diagnosticHost = {
        getNewLine: () => ts.sys.newLine,
        getCurrentDirectory: () => cwd,
        getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? x => x : x => x.toLowerCase()
    };

    sourceMapSupport.install({
        environment: 'node',
        retrieveFile(pathOrUrl) {
            let path = pathOrUrl;
            if (options.experimentalEsmLoader && path.startsWith('file://')) {
                try {
                    path = url.fileURLToPath(path);
                } catch (e) {}
            }
            path = normalizeSlashes(path);
            return (outputCache.get(path)?.content) || '';
        }
    });

    const formatDiagnostics = process.stdout.isTTY || options.pretty
        ? (ts.formatDiagnosticsWithColorAndContext || ts.formatDiagnostics)
        : ts.formatDiagnostics;

    function createTSError(diagnostics) {
        const diagnosticText = formatDiagnostics(diagnostics, diagnosticHost);
        const diagnosticCodes = diagnostics.map(x => x.code);
        return new TSError(diagnosticText, diagnosticCodes);
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

    const getExtension = config.options.jsx === ts.JsxEmit.Preserve
        ? (path) => /\.[tj]sx$/.test(path) ? '.jsx' : '.js'
        : (_) => '.js';

    let getOutput;
    let getTypeInfo;
    const getCanonicalFileName = ts.createGetCanonicalFileName(ts.sys.useCaseSensitiveFileNames);

    function createResolverFunctions(serviceHost) {
        const moduleResolutionCache = ts.createModuleResolutionCache(cwd, getCanonicalFileName, config.options);
        const knownInternalFilenames = new Set();
        const internalBuckets = new Set();

        const moduleBucketRe = /.*\/node_modules\/(?:@[^\/]+\/)?[^\/]+\//;
        
        function getModuleBucket(filename) {
            const find = moduleBucketRe.exec(filename);
            return find ? find[0] : '';
        }

        function markBucketOfFilenameInternal(filename) {
            internalBuckets.add(getModuleBucket(filename));
        }

        function isFileInInternalBucket(filename) {
            return internalBuckets.has(getModuleBucket(filename));
        }

        function isFileKnownToBeInternal(filename) {
            return knownInternalFilenames.has(filename);
        }

        const fixupResolvedModule = (resolvedModule) => {
            const { resolvedFileName } = resolvedModule;
            if (!resolvedFileName) return;
            if (resolvedModule.isExternalLibraryImport && ((!resolvedFileName.endsWith('.d.ts') && resolvedFileName.endsWith('.ts')) ||
                isFileKnownToBeInternal(resolvedFileName) ||
                isFileInInternalBucket(resolvedFileName))) {
                resolvedModule.isExternalLibraryImport = false;
            }
            if (!resolvedModule.isExternalLibraryImport) {
                knownInternalFilenames.add(resolvedFileName);
            }
        };

        const resolveModuleNames = (moduleNames, containingFile, reusedNames, redirectedReference, optionsOnlyWithNewerTsVersions) => {
            return moduleNames.map(moduleName => {
                const { resolvedModule } = ts.resolveModuleName(moduleName, containingFile, config.options, serviceHost, moduleResolutionCache, redirectedReference);
                if (resolvedModule) {
                    fixupResolvedModule(resolvedModule);
                }
                return resolvedModule;
            });
        };

        const getResolvedModuleWithFailedLookupLocationsFromCache = (moduleName, containingFile) => {
            const ret = ts.resolveModuleNameFromCache(moduleName, containingFile, moduleResolutionCache);
            if (ret && ret.resolvedModule) {
                fixupResolvedModule(ret.resolvedModule);
            }
            return ret;
        };

        const resolveTypeReferenceDirectives = (typeDirectiveNames, containingFile, redirectedReference, options) => {
            return typeDirectiveNames.map(typeDirectiveName => {
                const { resolvedTypeReferenceDirective } = ts.resolveTypeReferenceDirective(typeDirectiveName, containingFile, config.options, serviceHost, redirectedReference);
                if (resolvedTypeReferenceDirective) {
                    fixupResolvedModule(resolvedTypeReferenceDirective);
                }
                return resolvedTypeReferenceDirective;
            });
        };

        return {
            resolveModuleNames,
            getResolvedModuleWithFailedLookupLocationsFromCache,
            resolveTypeReferenceDirectives,
            isFileKnownToBeInternal,
            markBucketOfFilenameInternal
        };
    }

    if (!transpileOnly) {
        const fileContents = new Map();
        const rootFileNames = new Set(config.fileNames);
        const cachedReadFile = cachedLookup(debugFn('readFile', readFile));

        if (!options.compilerHost) {
            let projectVersion = 1;
            const fileVersions = new Map(Array.from(rootFileNames).map(fileName => [fileName, 0]));
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
                    if (!contents) {
                        contents = cachedReadFile(fileName);
                        if (!contents) return;
                        fileVersions.set(fileName, 1);
                        fileContents.set(fileName, contents);
                        projectVersion++;
                    }
                    return ts.ScriptSnapshot.fromString(contents);
                },
                readFile: cachedReadFile,
                getDirectories: cachedLookup(debugFn('getDirectories', ts.sys.getDirectories)),
                fileExists: cachedLookup(debugFn('fileExists', fileExists)),
                directoryExists: cachedLookup(debugFn('directoryExists', ts.sys.directoryExists)),
                realpath: ts.sys.realpath ? cachedLookup(debugFn('realpath', ts.sys.realpath)) : undefined,
                getNewLine: () => ts.sys.newLine,
                useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
                getCurrentDirectory: () => cwd,
                getCompilationSettings: () => config.options,
                getDefaultLibFileName: () => ts.getDefaultLibFilePath(config.options),
                getCustomTransformers
            };
            const { resolveModuleNames, getResolvedModuleWithFailedLookupLocationsFromCache, resolveTypeReferenceDirectives, isFileKnownToBeInternal, markBucketOfFilenameInternal } = createResolverFunctions(serviceHost);
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
                debug('invariant: Is service.getProject() identical before and after getting emit output and diagnostics? (should always be true)', programBefore === programAfter);
                previousProgram = programAfter;
                const diagnosticList = filterDiagnostics(diagnostics, ignoreDiagnostics);
                if (diagnosticList.length) reportTSError(diagnosticList);
                if (output.emitSkipped) {
                    throw new TypeError(`${relative(cwd, fileName)}: Emit skipped`);
                }
                if (!output.outputFiles.length) {
                    throw new TypeError(`Unable to require file: ${relative(cwd, fileName)}\nThis is usually the result of a faulty configuration or import. Make sure there is a .js, .json or other executable extension with loader attached before ts-node available.`);
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
        } else {
            const sys = {
                ...ts.sys,
                ...diagnosticHost,
                readFile: (fileName) => {
                    const cacheContents = fileContents.get(fileName);
                    if (cacheContents) return cacheContents;
                    const contents = cachedReadFile(fileName);
                    if (contents) fileContents.set(fileName, contents);
                    return contents;
                },
                getDirectories: cachedLookup(debugFn('getDirectories', ts.sys.getDirectories)),
                fileExists: cachedLookup(debugFn('fileExists', fileExists)),
                directoryExists: cachedLookup(debugFn('directoryExists', ts.sys.directoryExists)),
                resolvePath: cachedLookup(debugFn('resolvePath', ts.sys.resolvePath)),
                realpath: ts.sys.realpath ? cachedLookup(debugFn('realpath', ts.sys.realpath)) : undefined
            };
            const host = ts.createIncrementalCompilerHost
                ? ts.createIncrementalCompilerHost(config.options, sys)
                : {
                    ...sys,
                    getSourceFile: (fileName, languageVersion) => {
                        const contents = sys.readFile(fileName);
                        if (!contents) return;
                        return ts.createSourceFile(fileName, contents, languageVersion);
                    },
                    getDefaultLibLocation: () => normalizeSlashes(dirname(compiler)),
                    getDefaultLibFileName: () => normalizeSlashes(join(dirname(compiler), ts.getDefaultLibFileName(config.options))),
                    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames
                };
            const { resolveModuleNames, resolveTypeReferenceDirectives, isFileKnownToBeInternal, markBucketOfFilenameInternal } = createResolverFunctions(host);
            host.resolveModuleNames = resolveModuleNames;
            host.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;
            let builderProgram = ts.createIncrementalProgram
                ? ts.createIncrementalProgram({
                    rootNames: Array.from(rootFileNames),
                    options: config.options,
                    host,
                    configFileParsingDiagnostics: config.errors,
                    projectReferences: config.projectReferences
                })
                : ts.createEmitAndSemanticDiagnosticsBuilderProgram(Array.from(rootFileNames), config.options, host, undefined, config.errors, config.projectReferences);
            const customTransformers = typeof transformers === 'function'
                ? transformers(builderProgram.getProgram())
                : transformers;
            const updateMemoryCache = (contents, fileName) => {
                const previousContents = fileContents.get(fileName);
                const contentsChanged = previousContents !== contents;
                if (contentsChanged) {
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
                const output = ['', ''];
                updateMemoryCache(code, fileName);
                const sourceFile = builderProgram.getSourceFile(fileName);
                if (!sourceFile) throw new TypeError(`Unable to read file: ${fileName}`);
                const program = builderProgram.getProgram();
                const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
                const diagnosticList = filterDiagnostics(diagnostics, ignoreDiagnostics);
                if (diagnosticList.length) reportTSError(diagnosticList);
                const result = builderProgram.emit(sourceFile, (path, file, writeByteOrderMark) => {
                    output[path.endsWith('.map') ? 1 : 0] = file;
                    if (options.emit) sys.writeFile(path, file, writeByteOrderMark);
                }, undefined, undefined, customTransformers);
                if (result.emitSkipped) {
                    throw new TypeError(`${relative(cwd, fileName)}: Emit skipped`);
                }
                if (output[0] === '') {
                    throw new TypeError(`Unable to require file: ${relative(cwd, fileName)}\nThis is usually the result of a faulty configuration or import. Make sure there is a .js, .json or other executable extension with loader attached before ts-node available.`);
                }
                return output;
            };
            getTypeInfo = (code, fileName, position) => {
                updateMemoryCache(code, fileName);
                const sourceFile = builderProgram.getSourceFile(fileName);
                if (!sourceFile) throw new TypeError(`Unable to read file: ${fileName}`);
                const node = getTokenAtPosition(ts, sourceFile, position);
                const checker = builderProgram.getProgram().getTypeChecker();
                const symbol = checker.getSymbolAtLocation(node);
                if (!symbol) return { name: '', comment: '' };
                const type = checker.getTypeOfSymbolAtLocation(symbol, node);
                const signatures = [...type.getConstructSignatures(), ...type.getCallSignatures()];
                return {
                    name: signatures.length ? signatures.map(x => checker.signatureToString(x)).join('\n') : checker.typeToString(type),
                    comment: ts.displayPartsToString(symbol ? symbol.getDocumentationComment(checker) : [])
                };
            };
            if (options.emit && config.options.incremental) {
                process.on('exit', () => {
                    builderProgram.getProgram().emitBuildInfo();
                });
            }
        }
    } else {
        if (typeof transformers === 'function') {
            throw new TypeError('Transformers function is unavailable in "--transpile-only"');
        }
        getOutput = (code, fileName) => {
            const result = ts.transpileModule(code, {
                fileName,
                compilerOptions: config.options,
                reportDiagnostics: true,
                transformers
            });
            const diagnosticList = filterDiagnostics(result.diagnostics || [], ignoreDiagnostics);
            if (diagnosticList.length) reportTSError(diagnosticList);
            return [result.outputText, result.sourceMapText];
        };
        getTypeInfo = () => {
            throw new TypeError('Type information is unavailable in "--transpile-only"');
        };
    }

    function compile(code, fileName, lineOffset = 0) {
        const normalizedFileName = normalizeSlashes(fileName);
        const [value, sourceMap] = getOutput(code, normalizedFileName);
        const output = updateOutput(value, normalizedFileName, sourceMap, getExtension);
        outputCache.set(normalizedFileName, { content: output });
        return output;
    }

    let active = true;
    const enabled = (enabled) => enabled === undefined ? active : (active = !!enabled);
    const extensions = getExtensions(config);
    const ignored = (fileName) => {
        if (!active) return true;
        const ext = extname(fileName);
        if (extensions.tsExtensions.includes(ext) || extensions.jsExtensions.includes(ext)) {
            const relname = path.relative(cwd, fileName);
            return !isScoped(relname) || shouldIgnore(relname);
        }
        return true;
    };
    return { ts, config, compile, getTypeInfo, ignored, enabled, options };
}

function createIgnore(ignore) {
    return (relname) => {
        const path = normalizeSlashes(relname);
        return ignore.some(x => x.test(path));
    };
}

function reorderRequireExtension(ext) {
    const old = require.extensions[ext];
    delete require.extensions[ext];
    require.extensions[ext] = old;
}

function registerExtensions(preferTsExts, extensions, service, originalJsHandler) {
    for (const ext of extensions) {
        registerExtension(ext, service, originalJsHandler);
    }
    if (preferTsExts) {
        const preferredExtensions = new Set([...extensions, ...Object.keys(require.extensions)]);
        for (const ext of preferredExtensions) reorderRequireExtension(ext);
    }
}

function registerExtension(ext, service, originalHandler) {
    const old = require.extensions[ext] || originalHandler;
    require.extensions[ext] = function (m, filename) {
        if (service.ignored(filename)) return old(m, filename);
        if (service.options.experimentalEsmLoader) {
            assertScriptCanLoadAsCJS(filename);
        }
        const _compile = m._compile;
        m._compile = function (code, fileName) {
            debug('module._compile', fileName);
            return _compile.call(this, service.compile(code, fileName), fileName);
        };
        return old(m, filename);
    };
}

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

function readConfig(cwd, ts, rawOptions) {
    let config = { compilerOptions: {} };
    let basePath = cwd;
    let configFileName = undefined;
    const { fileExists = ts.sys.fileExists, readFile = ts.sys.readFile, skipProject = DEFAULTS.skipProject, project = DEFAULTS.project } = rawOptions;
    if (!skipProject) {
        configFileName = project
            ? resolve(cwd, project)
            : ts.findConfigFile(cwd, fileExists);
        if (configFileName) {
            const result = ts.readConfigFile(configFileName, readFile);
            if (result.error) {
                return {
                    config: { errors: [result.error], fileNames: [], options: {} },
                    options: {}
                };
            }
            config = result.config;
            basePath = path.dirname(configFileName);
        }
    }
    const tsconfigOptions = { ...config['ts-node'] };
    const files = rawOptions.files ?? tsconfigOptions.files ?? DEFAULTS.files;
    if (!files) {
        config.files = [];
        config.include = [];
    }
    config.compilerOptions = {
        ...config.compilerOptions,
        ...DEFAULTS.compilerOptions,
        ...tsconfigOptions.compilerOptions,
        ...rawOptions.compilerOptions,
        ...TS_NODE_COMPILER_OPTIONS
    };
    const fixedConfig = fixConfig(ts, ts.parseJsonConfigFileContent(config, {
        fileExists,
        readFile,
        readDirectory: ts.sys.readDirectory,
        useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames
    }, basePath, undefined, configFileName));
    if (tsconfigOptions.require) {
        const tsconfigRelativeRequire = createRequire(configFileName);
        tsconfigOptions.require = tsconfigOptions.require.map((path) => {
            return tsconfigRelativeRequire.resolve(path);
        });
    }
    return { config: fixedConfig, options: tsconfigOptions };
}

function updateOutput(outputText, fileName, sourceMap, getExtension) {
    const base64Map = Buffer.from(updateSourceMap(sourceMap, fileName), 'utf8').toString('base64');
    const sourceMapContent = `data:application/json;charset=utf-8;base64,${base64Map}`;
    const sourceMapLength = `${basename(fileName)}.map`.length + (getExtension(fileName).length - extname(fileName).length);
    return outputText.slice(0, -sourceMapLength) + sourceMapContent;
}

function updateSourceMap(sourceMapText, fileName) {
    const sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = fileName;
    sourceMap.sources = [fileName];
    delete sourceMap.sourceRoot;
    return JSON.stringify(sourceMap);
}

function filterDiagnostics(diagnostics, ignore) {
    return diagnostics.filter(x => ignore.indexOf(x.code) === -1);
}

function getTokenAtPosition(ts, sourceFile, position) {
    let current = sourceFile;
    while (true) {
        for (const child of current.getChildren(sourceFile)) {
            const start = child.getFullStart();
            if (start > position)
                break;
            const end = child.getEnd();
            if (position <= end) {
                current = child;
                continue;
            }
        }
        return current;
    }
}