const readline = require('readline');

class Enquirer {
  constructor() {
    this.prompts = {};
  }

  register(name, prompt) {
    this.prompts[name] = prompt;
  }

  async prompt(questions) {
    const answers = {};
    for (let question of questions) {
      const Prompt = this.prompts[question.type];
      if (!Prompt) throw new Error(`Prompt type "${question.type}" not registered.`);
      const prompt = new Prompt(question);
      answers[question.name] = await prompt.run();
    }
    return answers;
  }
}

class InputPrompt {
  constructor(options) {
    this.name = options.name;
    this.message = options.message;
  }

  run() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(`${this.message}: `, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

// Usage example
(async () => {
  const enquirer = new Enquirer();
  enquirer.register('input', InputPrompt);

  const questions = [
    { type: 'input', name: 'username', message: 'What is your username?' }
  ];

  const answers = await enquirer.prompt(questions);
  console.log('Your answers:', answers);
})();
