"use strict";

const { input, select, number, confirm, rawlist, expand, checkbox, password, editor, search, Separator } = require("@inquirer/prompts");
const PromptUI = require("./ui/prompt.js").default;

const builtInPrompts = {
    input,
    select,
    list: select, // Deprecated alias for select
    number,
    confirm,
    rawlist,
    expand,
    checkbox,
    password,
    editor,
    search,
};

function createPromptModule(opt) {
    const promptModule = (questions, answers) => {
        const runner = new PromptUI(promptModule.prompts, opt);
        const promptPromise = runner.run(questions, answers);
        return Object.assign(promptPromise, { ui: runner });
    };

    promptModule.prompts = { ...builtInPrompts };

    promptModule.registerPrompt = function (name, prompt) {
        promptModule.prompts[name] = prompt;
        return this;
    };

    promptModule.restoreDefaultPrompts = function () {
        promptModule.prompts = { ...builtInPrompts };
    };

    return promptModule;
}

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
        Prompt: PromptUI,
    },
    createPromptModule,
    registerPrompt,
    restoreDefaultPrompts,
    Separator,
};

exports.default = inquirer;
exports.createPromptModule = createPromptModule;
