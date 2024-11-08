'use strict';

const debug = require('debug');
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

function _interopRequireDefault(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
}

const debugOrig = _interopRequireDefault(debug);
const fsOrig = _interopRequireDefault(fs);
const importFreshOrig = _interopRequireDefault(importFresh);
const ModuleOrig = _interopRequireDefault(Module);
const pathOrig = _interopRequireDefault(path);
const stripCommentsOrig = _interopRequireDefault(stripComments);
const assertOrig = _interopRequireDefault(assert);
const ignoreOrig = _interopRequireDefault(ignore);
const utilOrig = _interopRequireDefault(util);
const minimatchOrig = _interopRequireDefault(minimatch);
const AjvOrig = _interopRequireDefault(Ajv);
const globalsOrig = _interopRequireDefault(globals);
const osOrig = _interopRequireDefault(os);

const DefaultPatterns = Object.freeze(["/**/node_modules/*"]);
const DotPatterns = Object.freeze([".*", "!.eslintrc.*", "!../"]);

class IgnorePattern {
    static get DefaultPatterns() {
        return DefaultPatterns;
    }

    static createDefaultIgnore(cwd) {
        return this.createIgnore([new IgnorePattern(DefaultPatterns, cwd)]);
    }

    static createIgnore(ignorePatterns) {
        const basePath = getCommonAncestorPath(ignorePatterns.map(p => p.basePath));
        const patterns = [].concat(...ignorePatterns.map(p => p.getPatternsRelativeTo(basePath)));
        const ig = ignoreOrig.default({ allowRelativePaths: true }).add([...DotPatterns, ...patterns]);
        const dotIg = ignoreOrig.default({ allowRelativePaths: true }).add(patterns);

        return Object.assign(
            (filePath, dot = false) => {
                assertOrig.default(pathOrig.default.isAbsolute(filePath), "'filePath' should be an absolute path.");
                const relPathRaw = relative(basePath, filePath);
                const relPath = relPathRaw && (relPathRaw + dirSuffix(filePath));
                const adoptedIg = dot ? dotIg : ig;
                const result = relPath !== "" && adoptedIg.ignores(relPath);

                return result;
            },
            { basePath, patterns }
        );
    }

    constructor(patterns, basePath) {
        assertOrig.default(pathOrig.default.isAbsolute(basePath), "'basePath' should be an absolute path.");
        this.patterns = patterns;
        this.basePath = basePath;
        this.loose = false;
    }

    getPatternsRelativeTo(newBasePath) {
        assertOrig.default(pathOrig.default.isAbsolute(newBasePath), "'newBasePath' should be an absolute path.");
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

const configFilenames = [
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    ".eslintrc.json",
    ".eslintrc",
    "package.json"
];

function isFilePath(nameOrPath) {
    return (
        /^\.{1,2}[/\\]/u.test(nameOrPath) ||
        pathOrig.default.isAbsolute(nameOrPath)
    );
}

function readFile(filePath) {
    return fsOrig.default.readFileSync(filePath, "utf8").replace(/^\ufeff/u, "");
}

function loadYAMLConfigFile(filePath) {
    const yaml = require("js-yaml");

    try {
        return yaml.load(readFile(filePath)) || {};
    } catch (e) {
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
}

function loadJSONConfigFile(filePath) {
    try {
        return JSON.parse(stripCommentsOrig.default(readFile(filePath)));
    } catch (e) {
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
}

function loadLegacyConfigFile(filePath) {
    const yaml = require("js-yaml");

    try {
        return yaml.load(stripCommentsOrig.default(readFile(filePath))) || {};
    } catch (e) {
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
}

function loadJSConfigFile(filePath) {
    try {
        return importFreshOrig.default(filePath);
    } catch (e) {
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
}

function loadPackageJSONConfigFile(filePath) {
    try {
        const packageData = loadJSONConfigFile(filePath);

        if (!Object.hasOwnProperty.call(packageData, "eslintConfig")) {
            throw new Error("package.json file doesn't have 'eslintConfig' field.");
        }

        return packageData.eslintConfig;
    } catch (e) {
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
}

function loadESLintIgnoreFile(filePath) {
    try {
        return readFile(filePath)
            .split(/\r?\n/gu)
            .filter(line => line.trim() !== "" && !line.startsWith("#"));
    } catch (e) {
        e.message = `Cannot read .eslintignore file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
}

function configInvalidError(configName, importerName, messageTemplate) {
    return new Error(`Failed to load config "${configName}" to extend from.`);
}

function loadConfigFile(filePath) {
    switch (pathOrig.default.extname(filePath)) {
        case ".js":
        case ".cjs":
            return loadJSConfigFile(filePath);

        case ".json":
            if (pathOrig.default.basename(filePath) === "package.json") {
                return loadPackageJSONConfigFile(filePath);
            }
            return loadJSONConfigFile(filePath);

        case ".yaml":
        case ".yml":
            return loadYAMLConfigFile(filePath);

        default:
            return loadLegacyConfigFile(filePath);
    }
}

function createContext({ cwd, resolvePluginsRelativeTo = cwd }, providedType, providedName, providedFilePath, providedMatchBasePath) {
    const filePath = providedFilePath
        ? pathOrig.default.resolve(cwd, providedFilePath)
        : "";
    const matchBasePath =
        (providedMatchBasePath && pathOrig.default.resolve(cwd, providedMatchBasePath)) ||
        (filePath && pathOrig.default.dirname(filePath)) ||
        cwd;
    const pluginBasePath = resolvePluginsRelativeTo || (filePath && pathOrig.default.dirname(filePath)) || cwd;
    const type = providedType || "config";

    return { filePath, matchBasePath, type, pluginBasePath };
}

function normalizePlugin(plugin) {
    return {
        configs: plugin.configs || {},
        environments: plugin.environments || {},
        processors: plugin.processors || {},
        rules: plugin.rules || {}
    };
}

class ConfigArrayFactory {
    constructor({ additionalPluginPool = new Map(), cwd = process.cwd(), resolvePluginsRelativeTo, builtInRules, resolver = ModuleOrig.default, eslintAllPath, getEslintAllConfig, eslintRecommendedPath, getEslintRecommendedConfig } = {}) {
        this.internalSlots = {
            additionalPluginPool,
            cwd,
            resolvePluginsRelativeTo: resolvePluginsRelativeTo && pathOrig.default.resolve(cwd, resolvePluginsRelativeTo),
            builtInRules,
            resolver,
            eslintAllPath,
            getEslintAllConfig,
            eslintRecommendedPath,
            getEslintRecommendedConfig
        };
    }

    create(configData, { basePath, filePath, name } = {}) {
        if (!configData) {
            return [];
        }

        const ctx = createContext(this.internalSlots, "config", name, filePath, basePath);
        return this._normalizeConfigData(configData, ctx);
    }

    loadFile(filePath, { basePath, name } = {}) {
        const ctx = createContext(this.internalSlots, "config", name, filePath, basePath);
        return [...this._loadConfigData(ctx)];
    }

    loadInDirectory(directoryPath, { basePath, name } = {}) {
        for (const filename of configFilenames) {
            const ctx = createContext(
                this.internalSlots,
                "config",
                name,
                pathOrig.default.join(directoryPath, filename),
                basePath
            );

            if (fsOrig.default.existsSync(ctx.filePath) && fsOrig.default.statSync(ctx.filePath).isFile()) {
                let configData;

                try {
                    configData = loadConfigFile(ctx.filePath);
                } catch (error) {
                    if (!error || error.code !== "ESLINT_CONFIG_FIELD_NOT_FOUND") {
                        throw error;
                    }
                }

                if (configData) {
                    return [...this._normalizeConfigData(configData, ctx)];
                }
            }
        }

        return [];
    }

    loadESLintIgnore(filePath) {
        const ctx = createContext(this.internalSlots, "ignore", undefined, filePath);
        const ignorePatterns = loadESLintIgnoreFile(ctx.filePath);
        return [...this._normalizeESLintIgnoreData(ignorePatterns, ctx)];
    }

    loadDefaultESLintIgnore() {
        const eslintIgnorePath = pathOrig.default.resolve(this.internalSlots.cwd, ".eslintignore");
        const packageJsonPath = pathOrig.default.resolve(this.internalSlots.cwd, "package.json");

        if (fsOrig.default.existsSync(eslintIgnorePath)) {
            return this.loadESLintIgnore(eslintIgnorePath);
        }
        if (fsOrig.default.existsSync(packageJsonPath)) {
            const data = loadJSONConfigFile(packageJsonPath);

            if (Object.hasOwnProperty.call(data, "eslintIgnore")) {
                if (!Array.isArray(data.eslintIgnore)) {
                    throw new Error("Package.json eslintIgnore property requires an array of paths");
                }
                const ctx = createContext(this.internalSlots, "ignore", "eslintIgnore in package.json", packageJsonPath);
                return [...this._normalizeESLintIgnoreData(data.eslintIgnore, ctx)];
            }
        }
        
        return [];
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

        validator.validateConfigSchema(configData, ctx.filePath || ctx.name);
        return this._normalizeObjectConfigData(configData, ctx);
    }

    _normalizeObjectConfigData(configData, ctx) {
        const { files, excludedFiles, ...configBody } = configData;
        const criteria = OverrideTester.create(files, excludedFiles, ctx.matchBasePath);
        const elements = this._normalizeObjectConfigDataBody(configBody, ctx);

        for (const element of elements) {
            element.criteria = OverrideTester.and(criteria, element.criteria);

            if (element.criteria) {
                element.root = undefined;
            }

            yield element;
        }
    }

    _normalizeObjectConfigDataBody(
        {
            env,
            extends: extend,
            globals,
            ignorePatterns,
            noInlineConfig,
            parser: parserName,
            parserOptions,
            plugins: pluginList,
            processor,
            reportUnusedDisableDirectives,
            root,
            rules,
            settings,
            overrides: overrideList = []
        },
        ctx
    ) {
        const extendList = Array.isArray(extend) ? extend : [extend];
        const ignorePattern = ignorePatterns && new IgnorePattern(
            Array.isArray(ignorePatterns) ? ignorePatterns : [ignorePatterns],
            ctx.matchBasePath
        );

        for (const extendName of extendList.filter(Boolean)) {
            yield* this._loadExtends(extendName, ctx);
        }

        const parser = parserName ? this._loadParser(parserName, ctx) : undefined;
        const plugins = pluginList ? this._loadPlugins(pluginList, ctx) : undefined;

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
            yield* this._normalizeObjectConfigData(
                overrideList[i],
                { ...ctx, name: `${ctx.name}#overrides[${i}]` }
            );
        }
    }

    // (Other private methods for loading extends and plugins)
}

class FlatCompat {
    constructor({
        baseDirectory = process.cwd(),
        resolvePluginsRelativeTo = baseDirectory,
        recommendedConfig,
        allConfig
    } = {}) {
        this.baseDirectory = baseDirectory;
        this.resolvePluginsRelativeTo = resolvePluginsRelativeTo;
        this.configArrayFactory = new ConfigArrayFactory({
            cwd: baseDirectory,
            resolvePluginsRelativeTo,
            getEslintAllConfig: () => allConfig,
            getEslintRecommendedConfig: () => recommendedConfig
        });
    }

    config(eslintrcConfig) {
        const eslintrcArray = this.configArrayFactory.create(eslintrcConfig, {
            basePath: this.baseDirectory
        });

        const flatArray = [];
        let hasIgnorePatterns = false;

        eslintrcArray.forEach(configData => {
            if (configData.type === "config") {
                hasIgnorePatterns = hasIgnorePatterns || configData.ignorePattern;
                flatArray.push(...translateESLintRC(configData, {
                    resolveConfigRelativeTo: path.join(this.baseDirectory, "__placeholder.js"),
                    resolvePluginsRelativeTo: path.join(this.resolvePluginsRelativeTo, "__placeholder.js"),
                    pluginEnvironments: eslintrcArray.pluginEnvironments,
                    pluginProcessors: eslintrcArray.pluginProcessors
                }));
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
        return this.config({
            env: envConfig
        });
    }

    extends(...configsToExtend) {
        return this.config({
            extends: configsToExtend
        });
    }

    plugins(...plugins) {
        return this.config({
            plugins
        });
    }
}

module.exports = {
    FlatCompat
};
