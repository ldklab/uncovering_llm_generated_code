// Importing necessary modules
const readline = require('readline');

// Creating a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompting utility function
function prompt(question, callback) {
  rl.question(`${question}\n> `, (answer) => {
    callback(answer);
  });
}

// Handling different prompt types
function askQuestions(questions) {
  let index = 0;
  const answers = {};

  const processQuestion = () => {
    if (index < questions.length) {
      const question = questions[index];
      prompt(`${question.message}`, (answer) => {
        answers[question.name] = answer || question.default;
        index++;
        processQuestion();
      });
    } else {
      rl.close();
      console.log("Collected Answers:", answers);
    }
  };

  processQuestion();
}

// Example questions array
const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'What is your name?',
    default: 'User'
  },
  {
    type: 'confirm',
    name: 'continue',
    message: 'Do you want to continue?',
    default: 'yes'
  }
];

// Initiate the asking process
askQuestions(questions);
