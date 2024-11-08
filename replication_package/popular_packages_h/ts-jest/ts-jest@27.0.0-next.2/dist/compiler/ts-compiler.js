"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsCompiler = void 0;
var bs_logger_1 = require("bs-logger");
var lodash_memoize_1 = __importDefault(require("lodash.memoize"));
var path_1 = require("path");
var typescript_1 = require("typescript");
var compiler_utils_1 = require("./compiler-utils");
var constants_1 = require("../constants");
var logger_1 = require("../utils/logger");
var messages_1 = require("../utils/messages");
var AVAILABLE_ESM_MODULE_KINDS = [typescript_1.ModuleKind.ES2015, typescript_1.ModuleKind.ES2020, typescript_1.ModuleKind.ESNext];
var TsCompiler = (function () {
    function TsCompiler(configSet, jestCacheFS) {
        this.configSet = configSet;
        this.jestCacheFS = jestCacheFS;
        this._compilerCacheFS = new Map();
        this._projectVersion = 1;
        this._ts = configSet.compilerModule;
        this._logger = logger_1.rootLogger.child({ namespace: 'ts-compiler' });
        this._parsedTsConfig = this.configSet.parsedTsConfig;
        this._jestCacheFS = jestCacheFS;
        if (!this.configSet.isolatedModules) {
            this._createLanguageService();
        }
    }
    TsCompiler.prototype._createLanguageService = function () {
        var _a;
        var _this = this;
        var compilerOptions = __assign(__assign({}, this._parsedTsConfig.options), { module: typescript_1.ModuleKind.CommonJS });
        var serviceHostTraceCtx = (_a = {
                namespace: 'ts:serviceHost',
                call: null
            },
            _a[bs_logger_1.LogContexts.logLevel] = bs_logger_1.LogLevels.trace,
            _a);
        this._parsedTsConfig.fileNames
            .filter(function (fileName) { return !_this.configSet.isTestFile(fileName); })
            .forEach(function (fileName) { return _this._compilerCacheFS.set(fileName, 0); });
        this._cachedReadFile = this._logger.wrap(serviceHostTraceCtx, 'readFile', lodash_memoize_1.default(this._ts.sys.readFile));
        var moduleResolutionHost = {
            fileExists: lodash_memoize_1.default(this._ts.sys.fileExists),
            readFile: this._cachedReadFile,
            directoryExists: lodash_memoize_1.default(this._ts.sys.directoryExists),
            getCurrentDirectory: function () { return _this.configSet.cwd; },
            realpath: this._ts.sys.realpath && lodash_memoize_1.default(this._ts.sys.realpath),
            getDirectories: lodash_memoize_1.default(this._ts.sys.getDirectories),
        };
        var moduleResolutionCache = this._ts.createModuleResolutionCache(this.configSet.cwd, function (x) { return x; }, compilerOptions);
        var serviceHost = {
            getProjectVersion: function () { return String(_this._projectVersion); },
            getScriptFileNames: function () { return __spread(_this._compilerCacheFS.keys()); },
            getScriptVersion: function (fileName) {
                var normalizedFileName = path_1.normalize(fileName);
                var version = _this._compilerCacheFS.get(normalizedFileName);
                return version === undefined ? undefined : String(version);
            },
            getScriptSnapshot: function (fileName) {
                var _a, _b, _c;
                var normalizedFileName = path_1.normalize(fileName);
                var hit = _this._isFileInCache(normalizedFileName);
                _this._logger.trace({ normalizedFileName: normalizedFileName, cacheHit: hit }, 'getScriptSnapshot():', 'cache', hit ? 'hit' : 'miss');
                if (!hit) {
                    var fileContent = (_c = (_a = _this._jestCacheFS.get(normalizedFileName)) !== null && _a !== void 0 ? _a : (_b = _this._cachedReadFile) === null || _b === void 0 ? void 0 : _b.call(_this, normalizedFileName)) !== null && _c !== void 0 ? _c : undefined;
                    if (fileContent) {
                        _this._jestCacheFS.set(normalizedFileName, fileContent);
                        _this._compilerCacheFS.set(normalizedFileName, 1);
                    }
                }
                var contents = _this._jestCacheFS.get(normalizedFileName);
                if (contents === undefined)
                    return;
                return _this._ts.ScriptSnapshot.fromString(contents);
            },
            fileExists: lodash_memoize_1.default(this._ts.sys.fileExists),
            readFile: this._cachedReadFile,
            readDirectory: lodash_memoize_1.default(this._ts.sys.readDirectory),
            getDirectories: lodash_memoize_1.default(this._ts.sys.getDirectories),
            directoryExists: lodash_memoize_1.default(this._ts.sys.directoryExists),
            realpath: this._ts.sys.realpath && lodash_memoize_1.default(this._ts.sys.realpath),
            getNewLine: function () { return constants_1.LINE_FEED; },
            getCurrentDirectory: function () { return _this.configSet.cwd; },
            getCompilationSettings: function () { return compilerOptions; },
            getDefaultLibFileName: function () { return _this._ts.getDefaultLibFilePath(compilerOptions); },
            getCustomTransformers: function () { return _this.configSet.customTransformers; },
            resolveModuleNames: function (moduleNames, containingFile) {
                return moduleNames.map(function (moduleName) {
                    var resolvedModule = _this._ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost, moduleResolutionCache).resolvedModule;
                    return resolvedModule;
                });
            },
        };
        this._logger.debug('created language service');
        this._languageService = this._ts.createLanguageService(serviceHost, this._ts.createDocumentRegistry());
    };
    TsCompiler.prototype.getResolvedModulesMap = function (fileContent, fileName) {
        var _a, _b, _c;
        this._updateMemoryCache(fileContent, fileName);
        return (_c = (_b = (_a = this._languageService) === null || _a === void 0 ? void 0 : _a.getProgram()) === null || _b === void 0 ? void 0 : _b.getSourceFile(fileName)) === null || _c === void 0 ? void 0 : _c.resolvedModules;
    };
    TsCompiler.prototype.getCompiledOutput = function (fileContent, fileName, supportsStaticESM) {
        if (this._languageService) {
            this._logger.debug({ fileName: fileName }, 'getCompiledOutput(): compiling using language service');
            this._updateMemoryCache(fileContent, fileName);
            var output = this._languageService.getEmitOutput(fileName);
            this._logger.debug({ fileName: fileName }, 'getCompiledOutput(): computing diagnostics using language service');
            this._doTypeChecking(fileName);
            if (output.emitSkipped) {
                throw new TypeError(path_1.relative(this.configSet.cwd, fileName) + ": Emit skipped for language service");
            }
            if (!output.outputFiles.length) {
                throw new TypeError(messages_1.interpolate("Unable to require `.d.ts` file for file: {{file}}.\nThis is usually the result of a faulty configuration or import. Make sure there is a `.js`, `.json` or another executable extension available alongside `{{file}}`.", {
                    file: path_1.basename(fileName),
                }));
            }
            return compiler_utils_1.updateOutput(output.outputFiles[1].text, fileName, output.outputFiles[0].text);
        }
        else {
            var moduleKind = this._parsedTsConfig.options.module;
            if (supportsStaticESM && this.configSet.useESM) {
                moduleKind =
                    !moduleKind || (moduleKind && !AVAILABLE_ESM_MODULE_KINDS.includes(moduleKind))
                        ? typescript_1.ModuleKind.ESNext
                        : moduleKind;
            }
            else {
                moduleKind = typescript_1.ModuleKind.CommonJS;
            }
            this._logger.debug({ fileName: fileName }, 'getCompiledOutput(): compiling as isolated module');
            var result = this._ts.transpileModule(fileContent, {
                fileName: fileName,
                transformers: this.configSet.customTransformers,
                compilerOptions: __assign(__assign({}, this._parsedTsConfig.options), { module: moduleKind }),
                reportDiagnostics: this.configSet.shouldReportDiagnostics(fileName),
            });
            if (result.diagnostics && this.configSet.shouldReportDiagnostics(fileName)) {
                this.configSet.raiseDiagnostics(result.diagnostics, fileName, this._logger);
            }
            return compiler_utils_1.updateOutput(result.outputText, fileName, result.sourceMapText);
        }
    };
    TsCompiler.prototype._isFileInCache = function (fileName) {
        return (this._jestCacheFS.has(fileName) &&
            this._compilerCacheFS.has(fileName) &&
            this._compilerCacheFS.get(fileName) !== 0);
    };
    TsCompiler.prototype._updateMemoryCache = function (contents, fileName) {
        var _a;
        this._logger.debug({ fileName: fileName }, 'updateMemoryCache: update memory cache for language service');
        var shouldIncrementProjectVersion = false;
        var hit = this._isFileInCache(fileName);
        if (!hit) {
            this._compilerCacheFS.set(fileName, 1);
            shouldIncrementProjectVersion = true;
        }
        else {
            var prevVersion = (_a = this._compilerCacheFS.get(fileName)) !== null && _a !== void 0 ? _a : 0;
            var previousContents = this._jestCacheFS.get(fileName);
            if (previousContents !== contents) {
                this._compilerCacheFS.set(fileName, prevVersion + 1);
                if (hit)
                    shouldIncrementProjectVersion = true;
            }
            if (!this._parsedTsConfig.fileNames.includes(fileName)) {
                shouldIncrementProjectVersion = true;
            }
        }
        if (shouldIncrementProjectVersion)
            this._projectVersion++;
    };
    TsCompiler.prototype._doTypeChecking = function (fileName) {
        if (this.configSet.shouldReportDiagnostics(fileName)) {
            var diagnostics = this._languageService.getSemanticDiagnostics(fileName).concat(this._languageService.getSyntacticDiagnostics(fileName));
            this.configSet.raiseDiagnostics(diagnostics, fileName, this._logger);
        }
    };
    return TsCompiler;
}());
exports.TsCompiler = TsCompiler;
