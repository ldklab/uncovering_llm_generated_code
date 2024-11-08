'use strict';

const debugOrig = require('debug');
const fs = require('fs');
const importFresh = require('import-fresh');
const Module = require('module');
const path = require('path');
const stripComments = require('strip-json-comments');
const assert = require('assert');
const ignore = require('ignore');
const util = require('util');
const minimatch = require('minimatch');
const Ajv = require('ajv');
const globals = require('globals');
const os = require('os');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

const debugOrig__default = /*#__PURE__*/_interopDefaultLegacy(debugOrig);
const fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
const importFresh__default = /*#__PURE__*/_interopDefaultLegacy(importFresh);
const Module__default = /*#__PURE__*/_interopDefaultLegacy(Module);
const path__default = /*#__PURE__*/_interopDefaultLegacy(path);
const stripComments__default = /*#__PURE__*/_interopDefaultLegacy(stripComments);
const assert__default = /*#__PURE__*/_interopDefaultLegacy(assert);
const ignore__default = /*#__PURE__*/_interopDefaultLegacy(ignore);
const util__default = /*#__PURE__*/_interopDefaultLegacy(util);
const minimatch__default = /*#__PURE__*/_interopDefaultLegacy(minimatch);
const Ajv__default = /*#__PURE__*/_interopDefaultLegacy(Ajv);
const globals__default = /*#__PURE__*/_interopDefaultLegacy(globals);
const os__default = /*#__PURE__*/_interopDefaultLegacy(os);

// Utility functions
function getCommonAncestorPath(sourcePaths) {
    let result = sourcePaths[0];
    for (let i = 1; i < sourcePaths.length; ++i) {
        const a = result;
        const b = sourcePaths[i];
        result = a.length < b.length ? a : b;
        for (let j = 0, lastSepPos = 0; j < a.length && j < b.length; ++j) {
            if (a[j] !== b[j]) {
                result = a.slice(0, lastSepPos);
                break;
            }
            if (a[j] === path__default["default"].sep) {
                lastSepPos = j;
            }
        }
    }
    let resolvedResult = result || path__default["default"].sep;
    if (resolvedResult && resolvedResult.endsWith(":") && process.platform === "win32") {
        resolvedResult += path__default["default"].sep;
    }
    return resolvedResult;
}

function relative(from, to) {
    const relPath = path__default["default"].relative(from, to);
    if (path__default["default"].sep === "/") {
        return relPath;
    }
    return relPath.split(path__default["default"].sep).join("/");
}

function dirSuffix(filePath) {
    const isDir = (filePath.endsWith(path__default["default"].sep) || (process.platform === "win32" && filePath.endsWith("/")));
    return isDir ? "/" : "";
}

// IgnorePattern class
const DefaultPatterns = Object.freeze(["/**/node_modules/*"]);
class IgnorePattern {
    static get DefaultPatterns() {
        return DefaultPatterns;
    }
    static createDefaultIgnore(cwd) {
        return this.createIgnore([new IgnorePattern(DefaultPatterns, cwd)]);
    }
    static createIgnore(ignorePatterns) {
        debug$3("Create with: %o", ignorePatterns);
        const basePath = getCommonAncestorPath(ignorePatterns.map(p => p.basePath));
        const patterns = [].concat(...ignorePatterns.map(p => p.getPatternsRelativeTo(basePath)));
        const ig = ignore__default["default"]({ allowRelativePaths: true }).add(patterns);
        const dotIg = ignore__default["default"]({ allowRelativePaths: true }).add(patterns);
        debug$3("  processed: %o", { basePath, patterns });
        return Object.assign((filePath, dot = false) => {
            assert__default["default"](path__default["default"].isAbsolute(filePath), "'filePath' should be an absolute path.");
            const relPathRaw = relative(basePath, filePath);
            const relPath = relPathRaw && (relPathRaw + dirSuffix(filePath));
            const adoptedIg = dot ? dotIg : ig;
            const result = relPath !== "" && adoptedIg.ignores(relPath);
            debug$3("Check", { filePath, dot, relativePath: relPath, result });
            return result;
        }, { basePath, patterns });
    }
    constructor(patterns, basePath) {
        assert__default["default"](path__default["default"].isAbsolute(basePath), "'basePath' should be an absolute path.");
        this.patterns = patterns;
        this.basePath = basePath;
        this.loose = false;
    }
    getPatternsRelativeTo(newBasePath) {
        assert__default["default"](path__default["default"].isAbsolute(newBasePath), "'newBasePath' should be an absolute path.");
        const { basePath, loose, patterns } = this;
        if (newBasePath === basePath) {
            return patterns;
        }
        const prefix = `/${relative(newBasePath, basePath)}`;
        return patterns.map(pattern => {
            const negative = pattern.startsWith("!");
            const head = negative ? "!" : "";
            const body = negative ? pattern.slice(1) : pattern;
            if (body.startsWith("/") || body.startsWith("../")) {
                return `${head}${prefix}${body}`;
            }
            return loose ? pattern : `${head}${prefix}/**/${body}`;
        });
    }
}

// ExtractedConfig class
class ExtractedConfig {
    constructor() {
        this.configNameOfNoInlineConfig = "";
        this.env = {};
        this.globals = {};
        this.ignores = void 0;
        this.noInlineConfig = void 0;
        this.parser = null;
        this.parserOptions = {};
        this.plugins = {};
        this.processor = null;
        this.reportUnusedDisableDirectives = void 0;
        this.rules = {};
        this.settings = {};
    }
    toCompatibleObjectAsConfigFileContent() {
        const {
            configNameOfNoInlineConfig: _ignore1,
            processor: _ignore2,
            ignores,
            ...config
        } = this;
        config.parser = config.parser && config.parser.filePath;
        config.plugins = Object.keys(config.plugins).filter(Boolean).reverse();
        config.ignorePatterns = ignores ? ignores.patterns : [];
        if (startsWith(config.ignorePatterns, IgnorePattern.DefaultPatterns)) {
            config.ignorePatterns = config.ignorePatterns.slice(IgnorePattern.DefaultPatterns.length);
        }
        return config;
    }
}

// ConfigArray class
class ConfigArray extends Array {
    get pluginEnvironments() {
        return ensurePluginMemberMaps(this).envMap;
    }
    get pluginProcessors() {
        return ensurePluginMemberMaps(this).processorMap;
    }
    get pluginRules() {
        return ensurePluginMemberMaps(this).ruleMap;
    }
    isRoot() {
        for (let i = this.length - 1; i >= 0; --i) {
            const root = this[i].root;
            if (typeof root === "boolean") {
                return root;
            }
        }
        return false;
    }
    extractConfig(filePath) {
        const { cache } = internalSlotsMap$2.get(this);
        const indices = getMatchedIndices(this, filePath);
        const cacheKey = indices.join(",");
        if (!cache.has(cacheKey)) {
            cache.set(cacheKey, createConfig(this, indices));
        }
        return cache.get(cacheKey);
    }
    isAdditionalTargetPath(filePath) {
        for (const { criteria, type } of this) {
            if (type === "config" && criteria && !criteria.endsWithWildcard && criteria.test(filePath)) {
                return true;
            }
        }
        return false;
    }
}

// ConfigArrayFactory class
class ConfigArrayFactory {
    constructor({ additionalPluginPool = new Map(), cwd = process.cwd(), resolvePluginsRelativeTo, builtInRules, resolver = ModuleResolver, eslintAllPath, getEslintAllConfig, eslintRecommendedPath, getEslintRecommendedConfig } = {}) {
        internalSlotsMap$1.set(this, {
            additionalPluginPool,
            cwd,
            resolvePluginsRelativeTo: resolvePluginsRelativeTo && path__default["default"].resolve(cwd, resolvePluginsRelativeTo),
            builtInRules,
            resolver,
            eslintAllPath,
            getEslintAllConfig,
            eslintRecommendedPath,
            getEslintRecommendedConfig
        });
    }
    create(configData, { basePath, filePath, name } = {}) {
        if (!configData) {
            return new ConfigArray();
        }
        const slots = internalSlotsMap$1.get(this);
        const ctx = createContext(slots, "config", name, filePath, basePath);
        const elements = this._normalizeConfigData(configData, ctx);
        return new ConfigArray(...elements);
    }
    loadFile(filePath, { basePath, name } = {}) {
        const slots = internalSlotsMap$1.get(this);
        const ctx = createContext(slots, "config", name, filePath, basePath);
        return new ConfigArray(...this._loadConfigData(ctx));
    }
    loadInDirectory(directoryPath, { basePath, name } = {}) {
        const slots = internalSlotsMap$1.get(this);
        for (const filename of configFilenames) {
            const ctx = createContext(slots, "config", name, path__default["default"].join(directoryPath, filename), basePath);
            if (fs__default["default"].existsSync(ctx.filePath) && fs__default["default"].statSync(ctx.filePath).isFile()) {
                let configData;
                try {
                    configData = loadConfigFile(ctx.filePath);
                } catch (error) {
                    if (!error || error.code !== "ESLINT_CONFIG_FIELD_NOT_FOUND") {
                        throw error;
                    }
                }
                if (configData) {
                    debug$2(`Config file found: ${ctx.filePath}`);
                    return new ConfigArray(...this._normalizeConfigData(configData, ctx));
                }
            }
        }
        debug$2(`Config file not found on ${directoryPath}`);
        return new ConfigArray();
    }
    static getPathToConfigFileInDirectory(directoryPath) {
        for (const filename of configFilenames) {
            const filePath = path__default["default"].join(directoryPath, filename);
            if (fs__default["default"].existsSync(filePath)) {
                if (filename === "package.json") {
                    try {
                        loadPackageJSONConfigFile(filePath);
                        return filePath;
                    } catch { }
                } else {
                    return filePath;
                }
            }
        }
        return null;
    }
    loadESLintIgnore(filePath) {
        const slots = internalSlotsMap$1.get(this);
        const ctx = createContext(slots, "ignore", void 0, filePath, slots.cwd);
        const ignorePatterns = loadESLintIgnoreFile(ctx.filePath);
        return new ConfigArray(...this._normalizeESLintIgnoreData(ignorePatterns, ctx));
    }
    loadDefaultESLintIgnore() {
        const slots = internalSlotsMap$1.get(this);
        const eslintIgnorePath = path__default["default"].resolve(slots.cwd, ".eslintignore");
        const packageJsonPath = path__default["default"].resolve(slots.cwd, "package.json");
        if (fs__default["default"].existsSync(eslintIgnorePath)) {
            return this.loadESLintIgnore(eslintIgnorePath);
        }
        if (fs__default["default"].existsSync(packageJsonPath)) {
            const data = loadJSONConfigFile(packageJsonPath);
            if (Object.hasOwnProperty.call(data, "eslintIgnore")) {
                if (!Array.isArray(data.eslintIgnore)) {
                    throw new Error("Package.json eslintIgnore property requires an array of paths");
                }
                const ctx = createContext(slots, "ignore", "eslintIgnore in package.json", packageJsonPath, slots.cwd);
                return new ConfigArray(...this._normalizeESLintIgnoreData(data.eslintIgnore, ctx));
            }
        }
        return new ConfigArray();
    }
    _loadConfigData(ctx) {
        return this._normalizeConfigData(loadConfigFile(ctx.filePath), ctx);
    }
    _normalizeESLintIgnoreData(ignorePatterns, ctx) {
        const elements = this._normalizeObjectConfigData({ ignorePatterns }, ctx);
        for (const element of elements) {
            if (element.ignorePattern) {
                element.ignorePattern.loose = true;
            }
            yield element;
        }
    }
    _normalizeConfigData(configData, ctx) {
        const validator = new ConfigValidator();
        validator.validateConfigSchema(configData, ctx.name || ctx.filePath);
        return this._normalizeObjectConfigData(configData, ctx);
    }
    _normalizeObjectConfigData(configData, ctx) {
        const { files, excludedFiles, ...configBody } = configData;
        const criteria = OverrideTester.create(files, excludedFiles, ctx.matchBasePath);
        const elements = this._normalizeObjectConfigDataBody(configBody, ctx);
        for (const element of elements) {
            element.criteria = OverrideTester.and(criteria, element.criteria);
            if (element.criteria) {
                element.root = void 0;
            }
            yield element;
        }
    }
    _normalizeObjectConfigDataBody({ env, extends: extend, globals, ignorePatterns, noInlineConfig, parser: parserName, parserOptions, plugins: pluginList, processor, reportUnusedDisableDirectives, root, rules, settings, overrides: overrideList = [] }, ctx) {
        const extendList = Array.isArray(extend) ? extend : [extend];
        const ignorePattern = ignorePatterns && new IgnorePattern(Array.isArray(ignorePatterns) ? ignorePatterns : [ignorePatterns], ctx.matchBasePath);
        for (const extendName of extendList.filter(Boolean)) {
            yield* this._loadExtends(extendName, ctx);
        }
        const parser = parserName && this._loadParser(parserName, ctx);
        const plugins = pluginList && this._loadPlugins(pluginList, ctx);
        if (plugins) {
            yield* this._takeFileExtensionProcessors(plugins, ctx);
        }
        yield {
            type: ctx.type,
            name: ctx.name,
            filePath: ctx.filePath,
            criteria: null,
            env,
            globals,
            ignorePattern,
            noInlineConfig,
            parser,
            parserOptions,
            plugins,
            processor,
            reportUnusedDisableDirectives,
            root,
            rules,
            settings
        };
        for (let i = 0; i < overrideList.length; ++i) {
            yield* this._normalizeObjectConfigData(overrideList[i], { ...ctx, name: `${ctx.name}#overrides[${i}]` });
        }
    }
    _loadExtends(extendName, ctx) {
        debug$2("Loading {extends:%j} relative to %s", extendName, ctx.filePath);
        try {
            if (extendName.startsWith("eslint:")) {
                return this._loadExtendedBuiltInConfig(extendName, ctx);
            }
            if (extendName.startsWith("plugin:")) {
                return this._loadExtendedPluginConfig(extendName, ctx);
            }
            return this._loadExtendedShareableConfig(extendName, ctx);
        } catch (error) {
            error.message += `\nReferenced from: ${ctx.filePath || ctx.name}`;
            throw error;
        }
    }
    _loadExtendedBuiltInConfig(extendName, ctx) {
        const { eslintAllPath, getEslintAllConfig, eslintRecommendedPath, getEslintRecommendedConfig } = internalSlotsMap$1.get(this);
        if (extendName === "eslint:recommended") {
            const name = `${ctx.name} » ${extendName}`;
            if (getEslintRecommendedConfig) {
                if (typeof getEslintRecommendedConfig !== "function") {
                    throw new Error(`getEslintRecommendedConfig must be a function instead of '${getEslintRecommendedConfig}'`);
                }
                return this._normalizeConfigData(getEslintRecommendedConfig(), { ...ctx, name, filePath: "" });
            }
            return this._loadConfigData({ ...ctx, name, filePath: eslintRecommendedPath });
        }
        if (extendName === "eslint:all") {
            const name = `${ctx.name} » ${extendName}`;
            if (getEslintAllConfig) {
                if (typeof getEslintAllConfig !== "function") {
                    throw new Error(`getEslintAllConfig must be a function instead of '${getEslintAllConfig}'`);
                }
                return this._normalizeConfigData(getEslintAllConfig(), { ...ctx, name, filePath: "" });
            }
            return this._loadConfigData({ ...ctx, name, filePath: eslintAllPath });
        }
        throw configInvalidError(extendName, ctx.name, "extend-config-missing");
    }
    _loadExtendedPluginConfig(extendName, ctx) {
        const slashIndex = extendName.lastIndexOf("/");
        if (slashIndex === -1) {
            throw configInvalidError(extendName, ctx.filePath, "plugin-invalid");
        }
        const pluginName = extendName.slice("plugin:".length, slashIndex);
        const configName = extendName.slice(slashIndex + 1);
        if (isFilePath(pluginName)) {
            throw new Error("'extends' cannot use a file path for plugins.");
        }
        const plugin = this._loadPlugin(pluginName, ctx);
        const configData =
            plugin.definition &&
            plugin.definition.configs[configName];
        if (configData) {
            return this._normalizeConfigData(configData, { ...ctx, filePath: plugin.filePath || ctx.filePath, name: `${ctx.name} » plugin:${plugin.id}/${configName}` });
        }
        throw plugin.error || configInvalidError(extendName, ctx.filePath, "extend-config-missing");
    }
    _loadExtendedShareableConfig(extendName, ctx) {
        const { cwd, resolver } = internalSlotsMap$1.get(this);
        const relativeTo = ctx.filePath || path__default["default"].join(cwd, "__placeholder__.js");
        let request;
        if (isFilePath(extendName)) {
            request = extendName;
        } else if (extendName.startsWith(".")) {
            request = `./${extendName}`;
        } else {
            request = normalizePackageName(extendName, "eslint-config");
        }
        let filePath;
        try {
            filePath = resolver.resolve(request, relativeTo);
        } catch (error) {
            if (error && error.code === "MODULE_NOT_FOUND") {
                throw configInvalidError(extendName, ctx.filePath, "extend-config-missing");
            }
            throw error;
        }
        writeDebugLogForLoading(request, relativeTo, filePath);
        return this._loadConfigData({ ...ctx, filePath, name: `${ctx.name} » ${request}` });
    }
    _loadPlugins(names, ctx) {
        return names.reduce((map, name) => {
            if (isFilePath(name)) {
                throw new Error("Plugins array cannot includes file paths.");
            }
            const plugin = this._loadPlugin(name, ctx);
            map[plugin.id] = plugin;
            return map;
        }, {});
    }
    _loadParser(nameOrPath, ctx) {
        debug$2("Loading parser %j from %s", nameOrPath, ctx.filePath);
        const { cwd, resolver } = internalSlotsMap$1.get(this);
        const relativeTo = ctx.filePath || path__default["default"].join(cwd, "__placeholder__.js");
        try {
            const filePath = resolver.resolve(nameOrPath, relativeTo);
            writeDebugLogForLoading(nameOrPath, relativeTo, filePath);
            return new ConfigDependency({
                definition: require$1(filePath),
                filePath,
                id: nameOrPath,
                importerName: ctx.name,
                importerPath: ctx.filePath
            });
        } catch (error) {
            if (nameOrPath === "espree") {
                debug$2("Fallback espree.");
                return new ConfigDependency({
                    definition: require$1("espree"),
                    filePath: require$1.resolve("espree"),
                    id: nameOrPath,
                    importerName: ctx.name,
                    importerPath: ctx.filePath
                });
            }
            debug$2("Failed to load parser '%s' declared in '%s'.", nameOrPath, ctx.name);
            error.message = `Failed to load parser '${nameOrPath}' declared in '${ctx.name}': ${error.message}`;
            return new ConfigDependency({
                error,
                id: nameOrPath,
                importerName: ctx.name,
                importerPath: ctx.filePath
            });
        }
    }
    _loadPlugin(name, ctx) {
        debug$2("Loading plugin %j from %s", name, ctx.filePath);
        const { additionalPluginPool, resolver } = internalSlotsMap$1.get(this);
        const request = normalizePackageName(name, "eslint-plugin");
        const id = getShorthandName(request, "eslint-plugin");
        const relativeTo = path__default["default"].join(ctx.pluginBasePath, "__placeholder__.js");
        if (name.match(/\s+/u)) {
            const error = Object.assign(
                new Error(`Whitespace found in plugin name '${name}'`),
                {
                    messageTemplate: "whitespace-found",
                    messageData: { pluginName: request }
                }
            );
            return new ConfigDependency({
                error,
                id,
                importerName: ctx.name,
                importerPath: ctx.filePath
            });
        }
        const plugin = additionalPluginPool.get(request) || additionalPluginPool.get(id);
        if (plugin) {
            return new ConfigDependency({
                definition: normalizePlugin(plugin),
                original: plugin,
                filePath: "",
                id,
                importerName: ctx.name,
                importerPath: ctx.filePath
            });
        }
        let filePath;
        let error;
        try {
            filePath = resolver.resolve(request, relativeTo);
        } catch (resolveError) {
            error = resolveError;
            if (error && error.code === "MODULE_NOT_FOUND") {
                error.messageTemplate = "plugin-missing";
                error.messageData = {
                    pluginName: request,
                    resolvePluginsRelativeTo: ctx.pluginBasePath,
                    importerName: ctx.name
                };
            }
        }
        if (filePath) {
            try {
                writeDebugLogForLoading(request, relativeTo, filePath);
                const startTime = Date.now();
                const pluginDefinition = require$1(filePath);
                debug$2(`Plugin ${filePath} loaded in: ${Date.now() - startTime}ms`);
                return new ConfigDependency({
                    definition: normalizePlugin(pluginDefinition),
                    original: pluginDefinition,
                    filePath,
                    id,
                    importerName: ctx.name,
                    importerPath: ctx.filePath
                });
            } catch (loadError) {
                error = loadError;
            }
        }
        debug$2("Failed to load plugin '%s' declared in '%s'.", name, ctx.name);
        error.message = `Failed to load plugin '${name}' declared in '${ctx.name}': ${error.message}`;
        return new ConfigDependency({
            error,
            id,
            importerName: ctx.name,
            importerPath: ctx.filePath
        });
    }
    _takeFileExtensionProcessors(plugins, ctx) {
        for (const pluginId of Object.keys(plugins)) {
            const processors = plugins[pluginId] && plugins[pluginId].definition && plugins[pluginId].definition.processors;
            if (!processors) {
                continue;
            }
            for (const processorId of Object.keys(processors)) {
                if (processorId.startsWith(".")) {
                    yield* this._normalizeObjectConfigData({ files: [`*${processorId}`], processor: `${pluginId}/${processorId}` }, { ...ctx, type: "implicit-processor", name: `${ctx.name}#processors["${pluginId}/${processorId}"]` });
                }
            }
        }
    }
}

// CascadingConfigArrayFactory class
class CascadingConfigArrayFactory {
    constructor({ additionalPluginPool = new Map(), baseConfig: baseConfigData = null, cliConfig: cliConfigData = null, cwd = process.cwd(), ignorePath, resolvePluginsRelativeTo, rulePaths = [], specificConfigPath = null, useEslintrc = true, builtInRules = new Map(), loadRules, resolver, eslintRecommendedPath, getEslintRecommendedConfig, eslintAllPath, getEslintAllConfig } = {}) {
        const configArrayFactory = new ConfigArrayFactory({
            additionalPluginPool,
            cwd,
            resolvePluginsRelativeTo,
            builtInRules,
            resolver,
            eslintRecommendedPath,
            getEslintRecommendedConfig,
            eslintAllPath,
            getEslintAllConfig
        });
        internalSlotsMap.set(this, {
            baseConfigArray: createBaseConfigArray({
                baseConfigData,
                configArrayFactory,
                cwd,
                rulePaths,
                loadRules
            }),
            baseConfigData,
            cliConfigArray: createCLIConfigArray({
                cliConfigData,
                configArrayFactory,
                cwd,
                ignorePath,
                specificConfigPath
            }),
            cliConfigData,
            configArrayFactory,
            configCache: new Map(),
            cwd,
            finalizeCache: new WeakMap(),
            ignorePath,
            rulePaths,
            specificConfigPath,
            useEslintrc,
            builtInRules,
            loadRules
        });
    }
    get cwd() {
        const { cwd } = internalSlotsMap.get(this);
        return cwd;
    }
    getConfigArrayForFile(filePath, { ignoreNotFoundError = false } = {}) {
        const { baseConfigArray, cliConfigArray, cwd } = internalSlotsMap.get(this);
        if (!filePath) {
            return new ConfigArray(...baseConfigArray, ...cliConfigArray);
        }
        const directoryPath = path__default["default"].dirname(path__default["default"].resolve(cwd, filePath));
        debug$1(`Load config files for ${directoryPath}.`);
        return this._finalizeConfigArray(this._loadConfigInAncestors(directoryPath), directoryPath, ignoreNotFoundError);
    }
    setOverrideConfig(configData) {
        const slots = internalSlotsMap.get(this);
        slots.cliConfigData = configData;
    }
    clearCache() {
        const slots = internalSlotsMap.get(this);
        slots.baseConfigArray = createBaseConfigArray(slots);
        slots.cliConfigArray = createCLIConfigArray(slots);
        slots.configCache.clear();
    }
    _loadConfigInAncestors(directoryPath, configsExistInSubdirs = false) {
        const { baseConfigArray, configArrayFactory, configCache, cwd, useEslintrc } = internalSlotsMap.get(this);
        if (!useEslintrc) {
            return baseConfigArray;
        }
        let configArray = configCache.get(directoryPath);
        if (configArray) {
            debug$1(`Cache hit: ${directoryPath}.`);
            return configArray;
        }
        debug$1(`No cache found: ${directoryPath}.`);
        const homePath = os__default["default"].homedir();
        if (directoryPath === homePath && cwd !== homePath) {
            debug$1("Stop traversing because of considered root.");
            if (configsExistInSubdirs) {
                const filePath = ConfigArrayFactory.getPathToConfigFileInDirectory(directoryPath);
                if (filePath) {
                    emitDeprecationWarning(filePath, "ESLINT_PERSONAL_CONFIG_SUPPRESS");
                }
            }
            return this._cacheConfig(directoryPath, baseConfigArray);
        }
        try {
            configArray = configArrayFactory.loadInDirectory(directoryPath);
        } catch (error) {
            if (error.code === "EACCES") {
                debug$1("Stop traversing because of 'EACCES' error.");
                return this._cacheConfig(directoryPath, baseConfigArray);
            }
            throw error;
        }
        if (configArray.length > 0 && configArray.isRoot()) {
            debug$1("Stop traversing because of 'root:true'.");
            configArray.unshift(...baseConfigArray);
            return this._cacheConfig(directoryPath, configArray);
        }
        const parentPath = path__default["default"].dirname(directoryPath);
        const parentConfigArray = parentPath && parentPath !== directoryPath
            ? this._loadConfigInAncestors(parentPath, configsExistInSubdirs || configArray.length > 0)
            : baseConfigArray;
        if (configArray.length > 0) {
            configArray.unshift(...parentConfigArray);
        } else {
            configArray = parentConfigArray;
        }
        return this._cacheConfig(directoryPath, configArray);
    }
    _cacheConfig(directoryPath, configArray) {
        const { configCache } = internalSlotsMap.get(this);
        Object.freeze(configArray);
        configCache.set(directoryPath, configArray);
        return configArray;
    }
    _finalizeConfigArray(configArray, directoryPath, ignoreNotFoundError) {
        const { cliConfigArray, configArrayFactory, finalizeCache, useEslintrc, builtInRules } = internalSlotsMap.get(this);
        let finalConfigArray = finalizeCache.get(configArray);
        if (!finalConfigArray) {
            finalConfigArray = configArray;
            if (useEslintrc && configArray.every(c => !c.filePath) && cliConfigArray.every(c => !c.filePath)) {
                const homePath = os__default["default"].homedir();
                debug$1("Loading the config file of the home directory:", homePath);
                const personalConfigArray = configArrayFactory.loadInDirectory(homePath, { name: "PersonalConfig" });
                if (personalConfigArray.length > 0 && !directoryPath.startsWith(homePath)) {
                    const lastElement = personalConfigArray[personalConfigArray.length - 1];
                    emitDeprecationWarning(lastElement.filePath, "ESLINT_PERSONAL_CONFIG_LOAD");
                }
                finalConfigArray = finalConfigArray.concat(personalConfigArray);
            }
            if (cliConfigArray.length > 0) {
                finalConfigArray = finalConfigArray.concat(cliConfigArray);
            }
            const validator = new ConfigValidator({ builtInRules });
            validator.validateConfigArray(finalConfigArray);
            Object.freeze(finalConfigArray);
            finalizeCache.set(configArray, finalConfigArray);
            debug$1("Configuration was determined: %o on %s", finalConfigArray, directoryPath);
        }
        if (!ignoreNotFoundError && useEslintrc && finalConfigArray.length <= 1) {
            throw new ConfigurationNotFoundError(directoryPath);
        }
        return finalConfigArray;
    }
}

// FlatCompat class
class FlatCompat {
    constructor({ baseDirectory = process.cwd(), resolvePluginsRelativeTo = baseDirectory, recommendedConfig, allConfig } = {}) {
        this.baseDirectory = baseDirectory;
        this.resolvePluginsRelativeTo = resolvePluginsRelativeTo;
        this[cafactory] = new ConfigArrayFactory({
            cwd: baseDirectory,
            resolvePluginsRelativeTo,
            getEslintAllConfig: () => {
                if (!allConfig) {
                    throw new TypeError("Missing parameter 'allConfig' in FlatCompat constructor.");
                }
                return allConfig;
            },
            getEslintRecommendedConfig: () => {
                if (!recommendedConfig) {
                    throw new TypeError("Missing parameter 'recommendedConfig' in FlatCompat constructor.");
                }
                return recommendedConfig;
            }
        });
    }
    config(eslintrcConfig) {
        const eslintrcArray = this[cafactory].create(eslintrcConfig, { basePath: this.baseDirectory });
        const flatArray = [];
        let hasIgnorePatterns = false;
        eslintrcArray.forEach(configData => {
            if (configData.type === "config") {
                hasIgnorePatterns = hasIgnorePatterns || configData.ignorePattern;
                flatArray.push(...translateESLintRC(configData, { resolveConfigRelativeTo: path__default["default"].join(this.baseDirectory, "__placeholder.js"), resolvePluginsRelativeTo: path__default["default"].join(this.resolvePluginsRelativeTo, "__placeholder.js"), pluginEnvironments: eslintrcArray.pluginEnvironments, pluginProcessors: eslintrcArray.pluginProcessors }));
            }
        });
        if (hasIgnorePatterns) {
            flatArray.unshift({
                ignores: [filePath => {
                    const finalConfig = eslintrcArray.extractConfig(filePath);
                    return Boolean(finalConfig.ignores) && finalConfig.ignores(filePath);
                }]
            });
        }
        return flatArray;
    }
    env(envConfig) {
        return this.config({ env: envConfig });
    }
    extends(...configsToExtend) {
        return this.config({ extends: configsToExtend });
    }
    plugins(...plugins) {
        return this.config({ plugins });
    }
}

// Exports
exports.FlatCompat = FlatCompat;
exports.Legacy = {
    ConfigArray,
    createConfigArrayFactoryContext: createContext,
    CascadingConfigArrayFactory,
    ConfigArrayFactory,
    ConfigDependency,
    ExtractedConfig,
    IgnorePattern,
    OverrideTester,
    getUsedExtractedConfigs,
    environments,
    loadConfigFile,
    ConfigOps,
    ConfigValidator,
    ModuleResolver,
    naming
};
