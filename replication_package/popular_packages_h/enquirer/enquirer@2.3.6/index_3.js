'use strict';

const assert = require('assert');
const Events = require('events');
const utils = require('./lib/utils');

class Enquirer extends Events {
  constructor(options = {}, answers = {}) {
    super();
    this.options = utils.merge({}, options);
    this.answers = { ...answers };
  }

  register(type, fn) {
    if (utils.isObject(type)) {
      Object.keys(type).forEach(key => this.register(key, type[key]));
      return this;
    }
    assert.strictEqual(typeof fn, 'function', 'expected a function');
    const name = type.toLowerCase();
    this.prompts[name] = fn.prototype instanceof this.Prompt ? fn : fn(this.Prompt, this);
    return this;
  }

  async prompt(questions = []) {
    const questionArray = [].concat(questions);
    for (let question of questionArray) {
      try {
        if (typeof question === 'function') question = await question.call(this);
        await this.ask(utils.merge({}, this.options, question));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return this.answers;
  }

  async ask(question) {
    if (typeof question === 'function') question = await question.call(this);
    const qOptions = utils.merge({}, this.options, question);
    let { type, name } = question || {};
    const { set, get } = utils;

    if (typeof type === 'function') type = await type.call(this, question, this.answers);
    if (!type) return this.answers[name];

    assert(this.prompts[type], `Prompt "${type}" is not registered`);

    const prompt = new this.prompts[type](qOptions);
    const previousValue = get(this.answers, name);

    prompt.state.answers = this.answers;
    prompt.enquirer = this;
    
    if (name) {
      prompt.on('submit', value => {
        this.emit('answer', name, value, prompt);
        set(this.answers, name, value);
      });
    }

    this.bubbleEvents(prompt);

    this.emit('prompt', prompt, this);

    if (qOptions.autofill && previousValue !== null) {
      prompt.value = prompt.input = previousValue;
      if (qOptions.autofill === 'show') await prompt.submit();
    } else {
      previousValue = prompt.value = await prompt.run();
    }
    return previousValue;
  }

  bubbleEvents(prompt) {
    const originalEmit = prompt.emit.bind(prompt);
    prompt.emit = (...args) => {
      this.emit(...args);
      return originalEmit(...args);
    };
  }

  use(plugin) {
    plugin.call(this, this);
    return this;
  }

  set Prompt(value) { this._Prompt = value; }
  get Prompt() { return this._Prompt || this.constructor.Prompt; }

  get prompts() { return this.constructor.prompts; }

  static set Prompt(value) { this._Prompt = value; }
  static get Prompt() { return this._Prompt || require('./lib/prompt'); }

  static get prompts() { return require('./lib/prompts'); }

  static get types() { return require('./lib/types'); }

  static get prompt() {
    const fn = (questions, ...rest) => {
      const enquirer = new this(...rest);
      const originalEmit = enquirer.emit.bind(enquirer);
      enquirer.emit = (...args) => {
        fn.emit(...args);
        return originalEmit(...args);
      };
      return enquirer.prompt(questions);
    };
    utils.mixinEmitter(fn, new Events());
    return fn;
  }
}

utils.mixinEmitter(Enquirer, new Events());
const promptModules = Enquirer.prompts;

for (const name in promptModules) {
  const key = name.toLowerCase();
  const run = options => new promptModules[name](options).run();
  Enquirer.prompt[key] = run;
  Enquirer[key] = run;

  if (!Enquirer[name]) {
    Reflect.defineProperty(Enquirer, name, { get: () => promptModules[name] });
  }
}

const exportPromptType = name => {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
};

['ArrayPrompt', 'AuthPrompt', 'BooleanPrompt', 'NumberPrompt', 'StringPrompt'].forEach(exportPromptType);

module.exports = Enquirer;
