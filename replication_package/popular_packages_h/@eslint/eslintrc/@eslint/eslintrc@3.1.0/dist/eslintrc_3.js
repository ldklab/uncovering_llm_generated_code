'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

const { Minimatch } = minimatch__default["default"];
const minimatchOpts = { dot: true, matchBase: true };

function normalizePatterns(patterns) {
    if (Array.isArray(patterns)) {
        return patterns.filter(Boolean);
    }
    if (typeof patterns === "string" && patterns) {
        return [patterns];
    }
    return [];
}

function toMatcher(patterns) {
    if (patterns.length === 0) {
        return null;
    }
    return patterns.map(pattern => {
        if (/^\.[/\\]/u.test(pattern)) {
            return new Minimatch(
                pattern.slice(2),
                { ...minimatchOpts, matchBase: false }
            );
        }
        return new Minimatch(pattern, minimatchOpts);
    });
}

function patternToJson({ includes, excludes }) {
    return {
        includes: includes && includes.map(m => m.pattern),
        excludes: excludes && excludes.map(m => m.pattern)
    };
}

class ConfigDependency {
    constructor({
        definition = null,
        original = null,
        error = null,
        filePath = null,
        id,
        importerName,
        importerPath
    }) {
        this.definition = definition;
        this.original = original;
        this.error = error;
        this.filePath = filePath;
        this.id = id;
        this.importerName = importerName;
        this.importerPath = importerPath;
    }

    toJSON() {
        const obj = this[util__default["default"].inspect.custom]();
        if (obj.error instanceof Error) {
            obj.error = { ...obj.error, message: obj.error.message };
        }
        return obj;
    }

    [util__default["default"].inspect.custom]() {
        const {
            definition: _ignore1,
            original: _ignore2,
            ...obj
        } = this;
        return obj;
    }
}

// ...Additional code includes various class definitions and utility functions...

class FlatCompat {
    constructor({
        baseDirectory = process.cwd(),
        resolvePluginsRelativeTo = baseDirectory,
        recommendedConfig,
        allConfig
    } = {}) {
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
        const eslintrcArray = this[cafactory].create(eslintrcConfig, {
            basePath: this.baseDirectory
        });

        const flatArray = [];
        let hasIgnorePatterns = false;

        eslintrcArray.forEach(configData => {
            if (configData.type === "config") {
                hasIgnorePatterns = hasIgnorePatterns || configData.ignorePattern;
                flatArray.push(...translateESLintRC(configData, {
                    resolveConfigRelativeTo: path__default["default"].join(this.baseDirectory, "__placeholder.js"),
                    resolvePluginsRelativeTo: path__default["default"].join(this.resolvePluginsRelativeTo, "__placeholder.js"),
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
