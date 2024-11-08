"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromptModule = createPromptModule;

const prompts_1 = require("@inquirer/prompts");
const prompt_js_1 = __importDefault(require("./ui/prompt.js"));

const builtInPrompts = {
    input: prompts_1.input,
    select: prompts_1.select,
    list: prompts_1.select, // @deprecated
    number: prompts_1.number,
    confirm: prompts_1.confirm,
    rawlist: prompts_1.rawlist,
    expand: prompts_1.expand,
    checkbox: prompts_1.checkbox,
    password: prompts_1.password,
    editor: prompts_1.editor,
    search: prompts_1.search,
};

function createPromptModule(opt) {
    function promptModule(questions, answers) {
        const runner = new prompt_js_1.default(promptModule.prompts, opt);
        const promptPromise = runner.run(questions, answers);
        return Object.assign(promptPromise, { ui: runner });
    }
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
        Prompt: prompt_js_1.default,
    },
    createPromptModule,
    registerPrompt,
    restoreDefaultPrompts,
    Separator: prompts_1.Separator,
};

exports.default = inquirer;
