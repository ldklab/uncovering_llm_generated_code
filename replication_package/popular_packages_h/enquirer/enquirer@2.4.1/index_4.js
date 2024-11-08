'use strict';

const assert = require('assert');
const Events = require('events');
const utils = require('./lib/utils');

// Enquirer class definition
class Enquirer extends Events {
  constructor(options, answers) {
    super();
    this.options = utils.merge({}, options);
    this.answers = { ...answers };
  }

  // Register a custom prompt type
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

  // Prompt users with questions
  async prompt(questions = []) {
    try {
      const questionsArray = [].concat(questions);
      for (let question of questionsArray) {
        if (typeof question === 'function') {
          question = await question.call(this);
        }
        await this.ask(utils.merge({}, this.options, question));
      }
      return this.answers;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Ask a question
  async ask(question) {
    if (typeof question === 'function') {
      question = await question.call(this);
    }

    const opts = utils.merge({}, this.options, question);
    const { type, name } = question;
    const { set, get } = utils;

    if (typeof type === 'function') {
      opts.type = await type.call(this, question, this.answers);
    }

    if (!opts.type || !(opts.type in this.prompts)) {
      return this.answers[name];
    }

    const prompt = new this.prompts[opts.type](opts);
    prompt.state.answers = this.answers;
    prompt.enquirer = this;

    if (name) {
      prompt.on('submit', value => {
        this.emit('answer', name, value, prompt);
        set(this.answers, name, value);
      });
    }

    // Emit prompt events
    const originalEmit = prompt.emit.bind(prompt);
    prompt.emit = (...args) => {
      this.emit(...args);
      return originalEmit(...args);
    };

    this.emit('prompt', prompt, this);

    let value = get(this.answers, name);
    if (opts.autofill && value != null) {
      prompt.value = prompt.input = value;
      if (opts.autofill === 'show') {
        await prompt.submit();
      }
    } else {
      value = prompt.value = await prompt.run();
    }

    return value;
  }

  // Use an Enquirer plugin
  use(plugin) {
    plugin.call(this, this);
    return this;
  }

  // Prompt property management
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

// Mix-in event methods to the Enquirer class
utils.mixinEmitter(Enquirer, new Events());
const prompts = Enquirer.prompts;

// Register prompt types on Enquirer class
Object.keys(prompts).forEach(name => {
  const key = name.toLowerCase();
  const createPromptRunner = options => new prompts[name](options).run();
  Enquirer.prompt[key] = createPromptRunner;
  Enquirer[key] = createPromptRunner;

  if (!Enquirer[name]) {
    Reflect.defineProperty(Enquirer, name, { get: () => prompts[name] });
  }
});

// Define additional exports
const defineExport = name => {
  utils.defineExport(Enquirer, name, () => Enquirer.types[name]);
};

['ArrayPrompt', 'AuthPrompt', 'BooleanPrompt', 'NumberPrompt', 'StringPrompt'].forEach(defineExport);

module.exports = Enquirer;
