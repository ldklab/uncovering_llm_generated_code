'use strict';

// Main module export
const inquirer = module.exports;

// Initialize prompts object and separators
inquirer.prompts = {};
inquirer.Separator = require('./objects/separator');

// User interface components
inquirer.ui = {
  BottomBar: require('./ui/bottom-bar'),
  Prompt: require('./ui/prompt'),
};

// Function to create a new prompt module
inquirer.createPromptModule = function (opt) {
  const promptModule = (questions, answers) => {
    let ui;
    try {
      ui = new inquirer.ui.Prompt(promptModule.prompts, opt);
    } catch (error) {
      return Promise.reject(error);
    }
    const promise = ui.run(questions, answers);
    promise.ui = ui; // Make UI publicly accessible via promise
    return promise;
  };

  // Register prompt types to promptModule
  promptModule.prompts = {};

  promptModule.registerPrompt = (name, prompt) => {
    promptModule.prompts[name] = prompt;
    return this;
  };

  // Load default prompt types
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

// Set up the default prompt interface
inquirer.prompt = inquirer.createPromptModule();

// Expose helper functions for user convenience
inquirer.registerPrompt = (name, prompt) => {
  inquirer.prompt.registerPrompt(name, prompt);
};

inquirer.restoreDefaultPrompts = () => {
  inquirer.prompt.restoreDefaultPrompts();
};
