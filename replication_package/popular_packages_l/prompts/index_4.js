const readline = require('readline');
const { EventEmitter } = require('events');

class Prompts extends EventEmitter {
  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.answers = {};
  }

  async ask(questions) {
    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    for (const q of questions) {
      let response = await this.prompt(q);
      if (q.name) {
        this.answers[q.name] = response;
      }
    }
    this.rl.close();
    return this.answers;
  }

  prompt(question) {
    return new Promise((resolve) => {
      const { message, initial, validate, format } = question;
      const formattedMessage = `${message}${initial ? ' (' + initial + ')' : ''}: `;

      this.rl.question(formattedMessage, (input) => {
        let value = input.trim() !== '' ? input : initial;

        if (validate) {
          const validationMessage = validate(value);
          if (validationMessage !== true) {
            console.log(validationMessage);
            return resolve(this.prompt(question));
          }
        }

        if (format) {
          value = format(value);
        }

        resolve(value);
      });
    });
  }
}

// Example usage
(async () => {
  const prompts = new Prompts();
  const response = await prompts.ask({
    type: 'number',
    name: 'age',
    message: 'How old are you?',
    validate: value => parseInt(value) < 18 ? 'Nightclub is 18+ only' : true
  });

  console.log(response); // Example output: { age: 24 }

  const responses = await prompts.ask([
    { type: 'text', name: 'username', message: 'What is your GitHub username?' },
    { type: 'number', name: 'age', message: 'How old are you?' },
    { type: 'text', name: 'about', message: 'Tell something about yourself', initial: 'Why should I?' }
  ]);

  console.log(responses); // Example output: { username: '...', age: '...', about: '...' }
})();
