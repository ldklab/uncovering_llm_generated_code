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
    if (!Array.isArray(questions)) questions = [questions]; // Normalize to array
    for (const question of questions) {
      let answer = await this.prompt(question);
      if (question.name) this.answers[question.name] = answer;
    }
    this.rl.close();
    return this.answers;
  }

  prompt(question) {
    return new Promise((resolve) => {
      const { type, name, message, initial, validate, format } = question;
      const fullMessage = `${message} ${initial ? '(' + initial + ') ' : ''}`;

      this.rl.question(fullMessage, (input) => {
        let response = input || initial;

        if (validate) {
          const isValid = validate(response);
          if (isValid !== true) {
            console.log(isValid);
            return resolve(this.prompt(question));
          }
        }

        if (format) response = format(response);

        resolve(response);
      });
    });
  }
}

(async () => {
  const prompts = new Prompts();
  
  const response = await prompts.ask({
    type: 'number',
    name: 'age',
    message: 'How old are you?',
    validate: value => value < 18 ? 'Nightclub is 18+ only' : true
  });
  console.log(response); // { age: 24 }

  const responses = await prompts.ask([
    { type: 'text', name: 'username', message: 'What is your GitHub username?' },
    { type: 'number', name: 'age', message: 'How old are you?' },
    { type: 'text', name: 'about', message: 'Tell something about yourself', initial: 'Why should I?' }
  ]);
  console.log(responses); // { username: '...', age: '...', about: '...' }
})();
