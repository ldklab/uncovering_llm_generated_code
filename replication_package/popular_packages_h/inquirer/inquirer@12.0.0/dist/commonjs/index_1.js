"use strict";
/**
 * Inquirer.js
 * A collection of common interactive command line user interfaces.
 */

const { input, select, number, confirm, rawlist, expand, checkbox, password, editor, search, Separator } = require("@inquirer/prompts");
const Prompt = require("./ui/prompt.js").default;

const builtInPrompts = {
    input,
    select,
    /** @deprecated `list` is now named `select` */
    list: select,
    number,
    confirm,
    rawlist,
    expand,
    checkbox,
    password,
    editor,
    search,
};

/**
 * Create a new self-contained prompt module.
 */
function createPromptModule(opt) {
    function promptModule(questions, answers) {
        const runner = new Prompt(promptModule.prompts, opt);
        const promptPromise = runner.run(questions, answers);
        return Object.assign(promptPromise, { ui: runner });
    }
    promptModule.prompts = { ...builtInPrompts };

    /**
     * Register a prompt type
     */
    promptModule.registerPrompt = function (name, prompt) {
        this.prompts[name] = prompt;
        return this;
    };
    
    /**
     * Register the defaults provider prompts
     */
    promptModule.restoreDefaultPrompts = function () {
        this.prompts = { ...builtInPrompts };
    };

    return promptModule;
}

/**
 * Public CLI helper interface
 */
const prompt = createPromptModule();

function registerPrompt(name, newPrompt) {
    prompt.registerPrompt(name, newPrompt);
}

function restoreDefaultPrompts() {
    prompt.restoreDefaultPrompts();
}

const inquirer = {
    prompt,
    ui: {
        Prompt,
    },
    createPromptModule,
    registerPrompt,
    restoreDefaultPrompts,
    Separator,
};

module.exports = inquirer;
