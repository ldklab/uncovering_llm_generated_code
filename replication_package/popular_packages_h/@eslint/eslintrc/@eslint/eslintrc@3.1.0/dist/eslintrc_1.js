'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const debugPkg = require('debug');
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

const debugOrig__default = _interopDefaultLegacy(debugPkg);
const fs__default = _interopDefaultLegacy(fs);
const importFresh__default = _interopDefaultLegacy(importFresh);
const Module__default = _interopDefaultLegacy(Module);
const path__default = _interopDefaultLegacy(path);
const stripComments__default = _interopDefaultLegacy(stripComments);
const assert__default = _interopDefaultLegacy(assert);
const ignore__default = _interopDefaultLegacy(ignore);
const util__default = _interopDefaultLegacy(util);
const minimatch__default = _interopDefaultLegacy(minimatch);
const Ajv__default = _interopDefaultLegacy(Ajv);
const globals__default = _interopDefaultLegacy(globals);
const os__default = _interopDefaultLegacy(os);

const debug = debugOrig__default.default("eslintrc:ignore-pattern");

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
            if (a[j] === path__default.default.sep) {
                lastSepPos = j;
            }
        }
    }

    let resolvedResult = result || path__default.default.sep;

    if (resolvedResult && resolvedResult.endsWith(":") && process.platform === "win32") {
        resolvedResult += path__default.default.sep;
    }
    return resolvedResult;
}

function relative(from, to) {
    const relPath = path__default.default.relative(from, to);

    if (path__default.default.sep === "/") {
        return relPath;
    }
    return relPath.split(path__default.default.sep).join("/");
}

function dirSuffix(filePath) {
    const isDir = (
        filePath.endsWith(path__default.default.sep) ||
        (process.platform === "win32" && filePath.endsWith("/"))
    );

    return isDir ? "/" : "";
}

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
        debug("Create with:", ignorePatterns);

        const basePath = getCommonAncestorPath(ignorePatterns.map(p => p.basePath));
        const patterns = [].concat(...ignorePatterns.map(p => p.getPatternsRelativeTo(basePath)));
        const ig = ignore__default.default({ allowRelativePaths: true }).add([...DotPatterns, ...patterns]);
        const dotIg = ignore__default.default({ allowRelativePaths: true }).add(patterns);

        debug("  processed:", { basePath, patterns });

        return Object.assign(
            (filePath, dot = false) => {
                assert__default.default(path__default.default.isAbsolute(filePath), "'filePath' should be an absolute path.");
                const relPathRaw = relative(basePath, filePath);
                const relPath = relPathRaw && (relPathRaw + dirSuffix(filePath));
                const adoptedIg = dot ? dotIg : ig;
                const result = relPath !== "" && adoptedIg.ignores(relPath);

                debug("Check", { filePath, dot, relativePath: relPath, result });
                return result;
            },
            { basePath, patterns }
        );
    }

    constructor(patterns, basePath) {
        assert__default.default(path__default.default.isAbsolute(basePath), "'basePath' should be an absolute path.");

        this.patterns = patterns;
        this.basePath = basePath;
        this.loose = false;
    }

    getPatternsRelativeTo(newBasePath) {
        assert__default.default(path__default.default.isAbsolute(newBasePath), "'newBasePath' should be an absolute path.");
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

// Some more functions, classes, and logic related to managing configurations, plugins, parsers, and environments...

// Exported modules
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
