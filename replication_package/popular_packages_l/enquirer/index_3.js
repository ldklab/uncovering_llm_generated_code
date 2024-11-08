const readline = require('readline');

class Enquirer {
  constructor() {
    this.prompts = {};
  }

  register(type, promptClass) {
    this.prompts[type] = promptClass;
  }

  async prompt(questions) {
    const answers = {};
    for (const question of questions) {
      const PromptClass = this.prompts[question.type];
      if (!PromptClass) throw new Error(`Prompt type "${question.type}" not registered.`);
      const promptInstance = new PromptClass(question);
      answers[question.name] = await promptInstance.run();
    }
    return answers;
  }
}

class InputPrompt {
  constructor({ name, message }) {
    this.name = name;
    this.message = message;
  }

  run() {
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(`${this.message}: `, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

(async () => {
  const enquirer = new Enquirer();
  enquirer.register('input', InputPrompt);

  const questions = [
    { type: 'input', name: 'username', message: 'What is your username?' }
  ];

  const answers = await enquirer.prompt(questions);
  console.log('Your answers:', answers);
})();
