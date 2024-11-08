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
    const questionArray = Array.isArray(questions) ? questions : [questions];
    for (let question of questionArray) {
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

    const promptType = typeof type === 'function' ? await type.call(this, question, this.answers) : type;
    if (!promptType) return this.answers[name];

    assert(this.prompts[promptType], `Prompt "${promptType}" is not registered`);
    const prompt = new this.prompts[promptType](opts);

    if (name) {
      prompt.on('submit', value => {
        this.emit('answer', name, value, prompt);
        utils.set(this.answers, name, value);
      });
    }

    this.emit('prompt', prompt, this);

    if (opts.autofill && this.answers[name] != null) {
      prompt.value = prompt.input = this.answers[name];
      if (opts.autofill === 'show') {
        await prompt.submit();
      }
    } else {
      this.answers[name] = prompt.value = await prompt.run();
    }

    return this.answers[name];
  }

  use(plugin) {
    plugin.call(this, this);
    return this;
  }

  set Prompt(value) {
    this._Prompt = value;
  }
  get Prompt() {
    return this._Prompt || Enquirer.Prompt;
  }

  get prompts() {
    return Enquirer.prompts;
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
    const promptFunction = (questions, ...rest) => {
      const enquirer = new this(...rest);
      enquirer.emit = new Proxy(enquirer.emit, {
        apply(target, thisArg, argumentsList) {
          promptFunction.emit(...argumentsList);
          return Reflect.apply(target, thisArg, argumentsList);
        }
      });
      return enquirer.prompt(questions);
    };
    utils.mixinEmitter(promptFunction, new Events());
    return promptFunction;
  }
}

utils.mixinEmitter(Enquirer, new Events());
const registeredPrompts = Enquirer.prompts;

Object.entries(registeredPrompts).forEach(([name, promptClass]) => {
  const key = name.toLowerCase();
  const runPrompt = options => new promptClass(options).run();
  Enquirer.prompt[key] = runPrompt;
  Enquirer[key] = runPrompt;

  if (!Enquirer[name]) {
    Reflect.defineProperty(Enquirer, name, { get: () => promptClass });
  }
});

function defineTypeExport(name) {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
}

['ArrayPrompt', 'AuthPrompt', 'BooleanPrompt', 'NumberPrompt', 'StringPrompt'].forEach(defineTypeExport);

module.exports = Enquirer;
