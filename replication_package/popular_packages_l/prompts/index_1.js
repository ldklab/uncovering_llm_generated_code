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
    const questionsArray = Array.isArray(questions) ? questions : [questions];
    
    for (const q of questionsArray) {
      const response = await this.prompt(q);
      if (q.name) {
        this.answers[q.name] = response;
      }
    }
    
    this.rl.close();
    return this.answers;
  }

  prompt(question) {
    return new Promise(resolve => {
      const { message, initial, validate, format } = question;
      const displayMessage = `${message} ${initial ? '(' + initial + ') ' : ''}`;

      this.rl.question(displayMessage, (input) => {
        let value = input || initial;

        if (validate) {
          const validationOutcome = validate(value);
          if (validationOutcome !== true) {
            console.log(validationOutcome);
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
  
  const singleResponse = await prompts.ask({
    type: 'number',
    name: 'age',
    message: 'How old are you?',
    validate: value => value < 18 ? 'Nightclub is 18+ only' : true
  });
  
  console.log(singleResponse); // => { age: 24 }
  
  const multipleResponses = await prompts.ask([
    { type: 'text', name: 'username', message: 'What is your GitHub username?' },
    { type: 'number', name: 'age', message: 'How old are you?' },
    { type: 'text', name: 'about', message: 'Tell something about yourself', initial: 'Why should I?' }
  ]);
  
  console.log(multipleResponses); // => { username: '...', age: '...', about: '...' }
})();
