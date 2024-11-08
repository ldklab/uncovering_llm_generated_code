// Implementation of the ESLintRC Library

class FlatCompat {
    constructor({ baseDirectory = process.cwd(), resolvePluginsRelativeTo, recommendedConfig, allConfig }) {
        this.baseDirectory = baseDirectory;
        this.resolvePluginsRelativeTo = resolvePluginsRelativeTo || baseDirectory;
        this.recommendedConfig = recommendedConfig;
        this.allConfig = allConfig;
    }

    extends(...configs) {
        return configs.map(config => ({ type: 'extends', name: config }));
    }

    env(environments) {
        return [{ type: 'env', environments }];
    }

    plugins(...plugins) {
        return [{ type: 'plugins', plugins }];
    }

    config(configuration) {
        const configArray = [];
        if (configuration.plugins) {
            configArray.push(...this.plugins(...configuration.plugins));
        }
        if (configuration.extends) {
            configArray.push(...this.extends(configuration.extends));
        }
        if (configuration.env) {
            configArray.push(...this.env(configuration.env));
        }
        if (configuration.rules) {
            configArray.push({ type: 'rules', rules: configuration.rules });
        }
        return configArray;
    }
}

// Usage Example (ESM)

import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("standard", "example"),
    ...compat.env({ es2020: true, node: true }),
    ...compat.plugins("airbnb", "react"),
    ...compat.config({
        plugins: ["airbnb", "react"],
        extends: "standard",
        env: { es2020: true, node: true },
        rules: { semi: "error" }
    })
];

// Usage Example (CommonJS)

const js = require("@eslint/js");
const path = require("path");

const compatCommonJS = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [
    ...compatCommonJS.extends("standard", "example"),
    ...compatCommonJS.env({ es2020: true, node: true }),
    ...compatCommonJS.plugins("airbnb", "react"),
    ...compatCommonJS.config({
        plugins: ["airbnb", "react"],
        extends: "standard",
        env: { es2020: true, node: true },
        rules: { semi: "error" }
    })
];
