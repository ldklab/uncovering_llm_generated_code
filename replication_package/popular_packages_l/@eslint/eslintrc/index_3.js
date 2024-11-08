// ESLintRC Compatibility Utility

class ESLintCompat {
    constructor({ baseDir = process.cwd(), pluginsPath, recommended, all }) {
        this.baseDir = baseDir;
        this.pluginsPath = pluginsPath || baseDir;
        this.recommended = recommended;
        this.all = all;
    }

    applyExtends(...configs) {
        return configs.map(config => ({ type: 'extends', config }));
    }

    applyEnv(envs) {
        return [{ type: 'env', environments: envs }];
    }

    applyPlugins(...plugins) {
        return [{ type: 'plugins', plugins }];
    }

    generateConfig(config) {
        const { plugins, extends: extendConfigs, env, rules } = config;
        const configResult = [];

        if (plugins) {
            configResult.push(...this.applyPlugins(...plugins));
        }

        if (extendConfigs) {
            configResult.push(...this.applyExtends(extendConfigs));
        }

        if (env) {
            configResult.push(...this.applyEnv(env));
        }

        if (rules) {
            configResult.push({ type: 'rules', rules });
        }

        return configResult;
    }
}

// ESM Usage Example

import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compatESM = new ESLintCompat({
    baseDir: __dirname,
    pluginsPath: __dirname,
    recommended: js.configs.recommended,
    all: js.configs.all
});

export default [
    ...compatESM.applyExtends("standard", "example"),
    ...compatESM.applyEnv({
        es2020: true,
        node: true
    }),
    ...compatESM.applyPlugins("airbnb", "react"),
    ...compatESM.generateConfig({
        plugins: ["airbnb", "react"],
        extends: "standard",
        env: {
            es2020: true,
            node: true
        },
        rules: {
            semi: "error"
        }
    })
];

// CommonJS Usage Example

const js = require("@eslint/js");
const path = require("path");

const compatCJS = new ESLintCompat({
    baseDir: __dirname,
    pluginsPath: __dirname,
    recommended: js.configs.recommended,
    all: js.configs.all
});

module.exports = [
    ...compatCJS.applyExtends("standard", "example"),
    ...compatCJS.applyEnv({
        es2020: true,
        node: true
    }),
    ...compatCJS.applyPlugins("airbnb", "react"),
    ...compatCJS.generateConfig({
        plugins: ["airbnb", "react"],
        extends: "standard",
        env: {
            es2020: true,
            node: true
        },
        rules: {
            semi: "error"
        }
    })
];
