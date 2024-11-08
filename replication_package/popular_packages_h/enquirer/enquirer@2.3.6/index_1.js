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
    assert.equal(typeof fn, 'function', 'expected a function');
    const name = type.toLowerCase();
    this.prompts[name] = fn.prototype instanceof this.Prompt ? fn : fn(this.Prompt, this);
    return this;
  }

  async prompt(questions = []) {
    for (const question of [].concat(questions)) {
      try {
        const resolvedQuestion = typeof question === 'function' ? await question.call(this) : question;
        await this.ask(utils.merge({}, this.options, resolvedQuestion));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return this.answers;
  }

  async ask(question) {
    const resolvedQuestion = typeof question === 'function' ? await question.call(this) : question;
    const opts = utils.merge({}, this.options, resolvedQuestion);
    const { type, name } = resolvedQuestion;
    const { set, get } = utils;

    const resolvedType = typeof type === 'function' ? await type.call(this, resolvedQuestion, this.answers) : type;
    if (!resolvedType) return this.answers[name];
    assert(this.prompts[resolvedType], `Prompt "${resolvedType}" is not registered`);

    const prompt = new this.prompts[resolvedType](opts);
    prompt.state.answers = this.answers;
    prompt.enquirer = this;

    if (name) {
      prompt.on('submit', value => {
        this.emit('answer', name, value, prompt);
        set(this.answers, name, value);
      });
    }

    prompt.emit = (...args) => {
      this.emit(...args);
      return Events.prototype.emit.apply(prompt, args);
    };

    this.emit('prompt', prompt, this);

    if (opts.autofill && get(this.answers, name) != null) {
      prompt.value = prompt.input = get(this.answers, name);
      if (opts.autofill === 'show') await prompt.submit();
    } else {
      const value = await prompt.run();
      prompt.value = value;
    }

    return prompt.value;
  }

  use(plugin) {
    plugin(this);
    return this;
  }

  set Prompt(value) {
    this._Prompt = value;
  }
  get Prompt() {
    return this._Prompt || this.constructor.Prompt;
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
    const promptFn = async (questions, ...rest) => {
      const enquirer = new this(...rest);
      enquirer.emit = (...args) => {
        promptFn.emit(...args);
        return Events.prototype.emit.apply(enquirer, args);
      };
      return enquirer.prompt(questions);
    };
    utils.mixinEmitter(promptFn, new Events());
    return promptFn;
  }
}

utils.mixinEmitter(Enquirer, new Events());

const prompts = Enquirer.prompts;
Object.keys(prompts).forEach(name => {
  const key = name.toLowerCase();
  const run = options => new prompts[name](options).run();
  Enquirer.prompt[key] = run;
  Enquirer[key] = run;

  if (!Enquirer[name]) {
    Reflect.defineProperty(Enquirer, name, { get: () => prompts[name] });
  }
});

const exportPrompt = name => {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
};

exportPrompt('ArrayPrompt');
exportPrompt('AuthPrompt');
exportPrompt('BooleanPrompt');
exportPrompt('NumberPrompt');
exportPrompt('StringPrompt');

module.exports = Enquirer;
