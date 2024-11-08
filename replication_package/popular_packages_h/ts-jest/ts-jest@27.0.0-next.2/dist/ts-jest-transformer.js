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
exports.TsJestTransformer = exports.CACHE_KEY_EL_SEPARATOR = void 0;
var fs_1 = require("fs");
var mkdirp_1 = __importDefault(require("mkdirp"));
var path_1 = require("path");
var ts_jest_compiler_1 = require("./compiler/ts-jest-compiler");
var config_set_1 = require("./config/config-set");
var constants_1 = require("./constants");
var json_1 = require("./utils/json");
var jsonable_value_1 = require("./utils/jsonable-value");
var logger_1 = require("./utils/logger");
var messages_1 = require("./utils/messages");
var importer_1 = require("./utils/importer");
var sha1_1 = require("./utils/sha1");
var version_checkers_1 = require("./utils/version-checkers");
exports.CACHE_KEY_EL_SEPARATOR = '\x00';
var TsJestTransformer = (function () {
    function TsJestTransformer() {
        this._depGraphs = new Map();
        this._logger = logger_1.rootLogger.child({ namespace: 'ts-jest-transformer' });
        version_checkers_1.VersionCheckers.jest.warn();
        this._logger.debug('created new transformer');
    }
    TsJestTransformer.prototype._configsFor = function (transformOptions) {
        var config = transformOptions.config, cacheFS = transformOptions.cacheFS;
        var ccs = TsJestTransformer._cachedConfigSets.find(function (cs) { return cs.jestConfig.value === config; });
        var configSet;
        if (ccs) {
            this._transformCfgStr = ccs.transformerCfgStr;
            this._compiler = ccs.compiler;
            configSet = ccs.configSet;
        }
        else {
            var serializedJestCfg_1 = json_1.stringify(config);
            var serializedCcs = TsJestTransformer._cachedConfigSets.find(function (cs) { return cs.jestConfig.serialized === serializedJestCfg_1; });
            if (serializedCcs) {
                serializedCcs.jestConfig.value = config;
                this._transformCfgStr = serializedCcs.transformerCfgStr;
                this._compiler = serializedCcs.compiler;
                configSet = serializedCcs.configSet;
            }
            else {
                this._logger.info('no matching config-set found, creating a new one');
                configSet = new config_set_1.ConfigSet(config);
                var jest_1 = __assign({}, config);
                jest_1.name = undefined;
                jest_1.cacheDirectory = undefined;
                this._transformCfgStr = new jsonable_value_1.JsonableValue(__assign(__assign({ digest: configSet.tsJestDigest, babel: configSet.babelConfig }, jest_1), { tsconfig: {
                        options: configSet.parsedTsConfig.options,
                        raw: configSet.parsedTsConfig.raw,
                    } })).serialized;
                this._compiler = new ts_jest_compiler_1.TsJestCompiler(configSet, cacheFS);
                TsJestTransformer._cachedConfigSets.push({
                    jestConfig: new jsonable_value_1.JsonableValue(config),
                    configSet: configSet,
                    transformerCfgStr: this._transformCfgStr,
                    compiler: this._compiler,
                });
                this._getFsCachedResolvedModules(configSet);
            }
        }
        return configSet;
    };
    TsJestTransformer.prototype.process = function (fileContent, filePath, transformOptions) {
        this._logger.debug({ fileName: filePath, transformOptions: transformOptions }, 'processing', filePath);
        var result;
        var jestConfig = transformOptions.config;
        var configs = this._configsFor(transformOptions);
        var hooksFile = process.env.TS_JEST_HOOKS;
        var hooks;
        if (hooksFile) {
            hooksFile = path_1.resolve(configs.cwd, hooksFile);
            hooks = importer_1.importer.tryTheseOr(hooksFile, {});
        }
        else {
            hooks = {};
        }
        var shouldStringifyContent = configs.shouldStringifyContent(filePath);
        var babelJest = shouldStringifyContent ? undefined : configs.babelJestTransformer;
        var isDefinitionFile = filePath.endsWith(constants_1.DECLARATION_TYPE_EXT);
        var isJsFile = constants_1.JS_JSX_REGEX.test(filePath);
        var isTsFile = !isDefinitionFile && constants_1.TS_TSX_REGEX.test(filePath);
        if (shouldStringifyContent) {
            result = "module.exports=" + json_1.stringify(fileContent);
        }
        else if (isDefinitionFile) {
            result = '';
        }
        else if (!configs.parsedTsConfig.options.allowJs && isJsFile) {
            this._logger.warn({ fileName: filePath }, messages_1.interpolate("Got a `.js` file to compile while `allowJs` option is not set to `true` (file: {{path}}). To fix this:\n  - if you want TypeScript to process JS files, set `allowJs` to `true` in your TypeScript config (usually tsconfig.json)\n  - if you do not want TypeScript to process your `.js` files, in your Jest config change the `transform` key which value is `ts-jest` so that it does not match `.js` files anymore", { path: filePath }));
            result = fileContent;
        }
        else if (isJsFile || isTsFile) {
            result = this._compiler.getCompiledOutput(fileContent, filePath, transformOptions.supportsStaticESM);
        }
        else {
            var message = babelJest ? "Got a unknown file type to compile (file: {{path}}). To fix this, in your Jest config change the `transform` key which value is `ts-jest` so that it does not match this kind of files anymore. If you still want Babel to process it, add another entry to the `transform` option with value `babel-jest` which key matches this type of files." : "Got a unknown file type to compile (file: {{path}}). To fix this, in your Jest config change the `transform` key which value is `ts-jest` so that it does not match this kind of files anymore.";
            this._logger.warn({ fileName: filePath }, messages_1.interpolate(message, { path: filePath }));
            result = fileContent;
        }
        if (babelJest) {
            this._logger.debug({ fileName: filePath }, 'calling babel-jest processor');
            result = babelJest.process(result, filePath, __assign(__assign({}, transformOptions), { instrument: false }));
        }
        if (hooks.afterProcess) {
            this._logger.debug({ fileName: filePath, hookName: 'afterProcess' }, 'calling afterProcess hook');
            var newResult = hooks.afterProcess([fileContent, filePath, jestConfig, transformOptions], result);
            if (newResult !== undefined) {
                return newResult;
            }
        }
        return result;
    };
    TsJestTransformer.prototype.getCacheKey = function (fileContent, filePath, transformOptions) {
        var _a;
        var configs = this._configsFor(transformOptions);
        this._logger.debug({ fileName: filePath, transformOptions: transformOptions }, 'computing cache key for', filePath);
        var _b = transformOptions.instrument, instrument = _b === void 0 ? false : _b;
        var constructingCacheKeyElements = [
            this._transformCfgStr,
            exports.CACHE_KEY_EL_SEPARATOR,
            configs.rootDir,
            exports.CACHE_KEY_EL_SEPARATOR,
            "instrument:" + (instrument ? 'on' : 'off'),
            exports.CACHE_KEY_EL_SEPARATOR,
            fileContent,
            exports.CACHE_KEY_EL_SEPARATOR,
            filePath,
        ];
        if (!configs.isolatedModules && this._tsResolvedModulesCachePath) {
            var resolvedModuleNames = void 0;
            if (((_a = this._depGraphs.get(filePath)) === null || _a === void 0 ? void 0 : _a.fileContent) === fileContent) {
                this._logger.debug({ fileName: filePath, transformOptions: transformOptions }, 'getting resolved modules from disk caching or memory caching for', filePath);
                resolvedModuleNames = this._depGraphs
                    .get(filePath)
                    .resolveModuleNames.filter(function (moduleName) { return fs_1.existsSync(moduleName); });
            }
            else {
                this._logger.debug({ fileName: filePath, transformOptions: transformOptions }, 'getting resolved modules from TypeScript API for', filePath);
                var resolvedModuleMap = this._compiler.getResolvedModulesMap(fileContent, filePath);
                resolvedModuleNames = resolvedModuleMap
                    ? __spread(resolvedModuleMap.values()).filter(function (resolvedModule) { return resolvedModule !== undefined; })
                        .map(function (resolveModule) { return resolveModule.resolvedFileName; })
                    : [];
                this._depGraphs.set(filePath, {
                    fileContent: fileContent,
                    resolveModuleNames: resolvedModuleNames,
                });
                fs_1.writeFileSync(this._tsResolvedModulesCachePath, json_1.stringify(__spread(this._depGraphs)));
            }
            resolvedModuleNames.forEach(function (moduleName) {
                constructingCacheKeyElements.push(exports.CACHE_KEY_EL_SEPARATOR, moduleName, exports.CACHE_KEY_EL_SEPARATOR, fs_1.statSync(moduleName).mtimeMs.toString());
            });
        }
        return sha1_1.sha1.apply(void 0, __spread(constructingCacheKeyElements));
    };
    TsJestTransformer.prototype._getFsCachedResolvedModules = function (configSet) {
        var cacheDir = configSet.tsCacheDir;
        if (!configSet.isolatedModules && cacheDir) {
            mkdirp_1.default.sync(cacheDir);
            this._tsResolvedModulesCachePath = path_1.join(cacheDir, sha1_1.sha1('ts-jest-resolved-modules', exports.CACHE_KEY_EL_SEPARATOR));
            try {
                var cachedTSResolvedModules = fs_1.readFileSync(this._tsResolvedModulesCachePath, 'utf-8');
                this._depGraphs = new Map(json_1.parse(cachedTSResolvedModules));
            }
            catch (e) { }
        }
    };
    TsJestTransformer._cachedConfigSets = [];
    return TsJestTransformer;
}());
exports.TsJestTransformer = TsJestTransformer;
