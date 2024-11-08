'use strict';

var inquirer = module.exports;

inquirer.prompts = {};

inquirer.Separator = require('./objects/separator');

inquirer.ui = {
  BottomBar: require('./ui/bottom-bar'),
  Prompt: require('./ui/prompt'),
};

inquirer.createPromptModule = function (opt) {
  var promptModule = function (questions, answers) {
    var ui;
    try {
      ui = new inquirer.ui.Prompt(promptModule.prompts, opt);
    } catch (error) {
      return Promise.reject(error);
    }
    var promise = ui.run(questions, answers);
    promise.ui = ui;
    return promise;
  };

  promptModule.prompts = {};

  promptModule.registerPrompt = function (name, prompt) {
    promptModule.prompts[name] = prompt;
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
