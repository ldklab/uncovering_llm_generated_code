'use strict';

const assert = require('assert');
const Events = require('events');
const utils = require('./lib/utils');

class Enquirer extends Events {
  constructor(options, answers) {
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
    for (let question of Array.isArray(questions) ? questions : [questions]) {
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

    let opts = utils.merge({}, this.options, question);
    let { type, name } = question;
    const { set, get } = utils;

    if (typeof type === 'function') {
      type = await type.call(this, question, this.answers);
    }

    assert(this.prompts[type], `Prompt "${type}" is not registered`);

    const prompt = new this.prompts[type](opts);
    const value = get(this.answers, name);

    prompt.state.answers = this.answers;
    prompt.enquirer = this;

    if (name) {
      prompt.on('submit', val => {
        this.emit('answer', name, val, prompt);
        set(this.answers, name, val);
      });
    }

    const emit = prompt.emit.bind(prompt);
    prompt.emit = (...args) => {
      this.emit(...args);
      return emit(...args);
    };

    this.emit('prompt', prompt, this);

    if (opts.autofill && value != null) {
      prompt.value = prompt.input = value;
      if (opts.autofill === 'show') {
        await prompt.submit();
      }
    } else {
      prompt.value = await prompt.run();
    }

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
      const emit = enquirer.emit.bind(enquirer);
      enquirer.emit = (...args) => {
        fn.emit(...args);
        return emit(...args);
      };
      return enquirer.prompt(questions);
    };
    utils.mixinEmitter(fn, new Events());
    return fn;
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

['ArrayPrompt', 'AuthPrompt', 'BooleanPrompt', 'NumberPrompt', 'StringPrompt'].forEach(name => {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
});

module.exports = Enquirer;
