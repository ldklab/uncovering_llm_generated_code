'use strict';

const inquirer = module.exports;

inquirer.prompts = {};

inquirer.Separator = require('./objects/separator');

inquirer.ui = {
  BottomBar: require('./ui/bottom-bar'),
  Prompt: require('./ui/prompt'),
};

inquirer.createPromptModule = function (opt) {
  const promptModule = function (questions, answers) {
    let uiInstance;
    try {
      uiInstance = new inquirer.ui.Prompt(promptModule.prompts, opt);
    } catch (error) {
      return Promise.reject(error);
    }
    const executionPromise = uiInstance.run(questions, answers);
    executionPromise.ui = uiInstance;
    return executionPromise;
  };

  promptModule.prompts = {};

  promptModule.registerPrompt = function (name, prompt) {
    this.prompts[name] = prompt;
    return this;
  };

  promptModule.restoreDefaultPrompts = function () {
    this.registerPrompt('list', require('./prompts/list'));
    this.registerPrompt('input', require('./prompts/input'));
    this.registerPrompt('number', require('./prompts/number'));
    this.registerPrompt('confirm', require('./prompts/confirm'));
    this.registerPrompt('rawlist', require('./prompts/rawlist'));
    this.registerPrompt('expand', require('./prompts/expand'));
    this.registerPrompt('checkbox', require('./prompts/checkbox'));
    this.registerPrompt('password', require('./prompts/password'));
    this.registerPrompt('editor', require('./prompts/editor'));
  };

  promptModule.restoreDefaultPrompts();

  return promptModule;
};

inquirer.prompt = inquirer.createPromptModule();

inquirer.registerPrompt = function (name, prompt) {
  inquirer.prompt.registerPrompt(name, prompt);
};

inquirer.restoreDefaultPrompts = function () {
  inquirer.prompt.restoreDefaultPrompts();
};
