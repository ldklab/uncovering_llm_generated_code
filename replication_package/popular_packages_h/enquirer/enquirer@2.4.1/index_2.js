'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const utils = require('./lib/utils');

class Enquirer extends EventEmitter {
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

    assert(typeof fn === 'function', 'expected a function');
    const name = type.toLowerCase();

    this.prompts[name] = fn.prototype instanceof this.Prompt ? fn : fn(this.Prompt, this);
    return this;
  }

  async prompt(questions = []) {
    questions = Array.isArray(questions) ? questions : [questions];
    for (let question of questions) {
      try {
        question = typeof question === 'function' ? await question.call(this) : question;
        await this.ask(utils.merge({}, this.options, question));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return this.answers;
  }

  async ask(question) {
    question = typeof question === 'function' ? await question.call(this) : question;
    const opts = utils.merge({}, this.options, question);
    const { type, name } = question;
    const { set, get } = utils;

    let promptType = typeof type === 'function' ? await type.call(this, question, this.answers) : type;
    if (!promptType) return this.answers[name];
    if (promptType === 'number') promptType = 'numeral';

    assert(this.prompts[promptType], `Prompt "${promptType}" is not registered`);

    const prompt = new this.prompts[promptType](opts);
    prompt.state.answers = this.answers;
    prompt.enquirer = this;

    if (name) prompt.on('submit', value => this._handleSubmission(name, value, prompt));
    this._bubbleEvents(prompt);

    this.emit('prompt', prompt, this);

    const value = opts.autofill && get(this.answers, name) != null
      ? await this._handleAutofill(prompt, opts)
      : await prompt.run();
    return value;
  }

  _handleSubmission(name, value, prompt) {
    this.emit('answer', name, value, prompt);
    utils.set(this.answers, name, value);
  }

  _bubbleEvents(prompt) {
    const originalEmit = prompt.emit.bind(prompt);
    prompt.emit = (...args) => {
      this.emit(...args);
      return originalEmit(...args);
    };
  }

  async _handleAutofill(prompt, opts) {
    prompt.value = prompt.input = get(this.answers, prompt.name);
    if (opts.autofill === 'show') await prompt.submit();
    return prompt.value;
  }

  use(plugin) {
    plugin.call(this, this);
    return this;
  }

  set Prompt(value) {
    this._Prompt = value;
  }

  get Prompt() {
    return this._Prompt || this.constructor.Prompt;
  }

  get prompts() {
    return this.constructor.prompts;
  }

  static set Prompt(value) {
    this._Prompt = value;
  }

  static get Prompt() {
    return this._Prompt || require('./lib/prompt');
  }

  static get prompts() {
    return require('./lib/prompts');
  }

  static get types() {
    return require('./lib/types');
  }

  static get prompt() {
    const fn = (questions, ...rest) => {
      const enquirer = new this(...rest);
      this._mixinPromptEmitter(fn, enquirer);
      return enquirer.prompt(questions);
    };
    utils.mixinEmitter(fn, new EventEmitter());
    return fn;
  }

  static _mixinPromptEmitter(fn, enquirer) {
    const originalEmit = enquirer.emit.bind(enquirer);
    enquirer.emit = (...args) => {
      fn.emit(...args);
      return originalEmit(...args);
    };
  }
}

utils.mixinEmitter(Enquirer, new EventEmitter());
const prompts = Enquirer.prompts;

for (let name of Object.keys(prompts)) {
  const key = name.toLowerCase();
  const run = options => new prompts[name](options).run();
  Enquirer.prompt[key] = run;
  Enquirer[key] = run;

  if (!Enquirer[name]) {
    Reflect.defineProperty(Enquirer, name, { get: () => prompts[name] });
  }
}

const define = name => {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
};

define('ArrayPrompt');
define('AuthPrompt');
define('BooleanPrompt');
define('NumberPrompt');
define('StringPrompt');

module.exports = Enquirer;
