"use strict";

// Import various components related to ESLint configuration management

const {
    ConfigArrayFactory,
    createContext: createConfigArrayFactoryContext
} = require("./config-array-factory");

const { CascadingConfigArrayFactory } = require("./cascading-config-array-factory");
const { ModuleResolver } = require("./shared/relative-module-resolver");
const { ConfigArray, getUsedExtractedConfigs } = require("./config-array");
const { ConfigDependency } = require("./config-array/config-dependency");
const { ExtractedConfig } = require("./config-array/extracted-config");
const { IgnorePattern } = require("./config-array/ignore-pattern");
const { OverrideTester } = require("./config-array/override-tester");
const ConfigOps = require("./shared/config-ops");
const ConfigValidator = require("./shared/config-validator");
const naming = require("./shared/naming");

// Export the imported components under a Legacy namespace

module.exports = {

    Legacy: {
        ConfigArray,
        createConfigArrayFactoryContext,
        CascadingConfigArrayFactory,
        ConfigArrayFactory,
        ConfigDependency,
        ExtractedConfig,
        IgnorePattern,
        OverrideTester,
        getUsedExtractedConfigs,

        // shared utilities and classes
        ConfigOps,
        ConfigValidator,
        ModuleResolver,
        naming
    }

};
