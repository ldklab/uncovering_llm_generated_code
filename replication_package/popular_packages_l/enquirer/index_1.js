const readline = require('readline');

class Enquirer {
  constructor() {
    this.prompts = {};
  }

  register(name, promptType) {
    this.prompts[name] = promptType;
  }

  async prompt(questions) {
    const responses = {};
    for (const question of questions) {
      const PromptType = this.prompts[question.type];
      if (!PromptType) throw new Error(`Prompt type "${question.type}" not registered.`);
      const promptInstance = new PromptType(question);
      responses[question.name] = await promptInstance.run();
    }
    return responses;
  }
}

class InputPrompt {
  constructor({ name, message }) {
    this.name = name;
    this.message = message;
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

// Example of using the Enquirer and InputPrompt
(async () => {
  const enquirer = new Enquirer();
  enquirer.register('input', InputPrompt);

  const questions = [
    { type: 'input', name: 'username', message: 'What is your username?' }
  ];

  try {
    const answers = await enquirer.prompt(questions);
    console.log('Your answers:', answers);
  } catch (error) {
    console.error(error);
  }
})();
