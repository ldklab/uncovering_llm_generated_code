// Importing the readline module to handle input
const readline = require('readline');

// Setting up readline to read from standard input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt a question and execute a callback with the answer
function prompt(question, callback) {
  rl.question(`${question}\n> `, (answer) => {
    callback(answer);
  });
}

// Function to sequentially ask multiple questions and handle their answers
function askQuestions(questions) {
  let currentIndex = 0; // To track the current question
  const collectedAnswers = {}; // Object to store the answers

  const handleNextQuestion = () => {
    if (currentIndex < questions.length) {
      const currentQuestion = questions[currentIndex];
      prompt(`${currentQuestion.message}`, (answer) => {
        collectedAnswers[currentQuestion.name] = answer || currentQuestion.default; // Store answer, use default if no input
        currentIndex++;
        handleNextQuestion(); // Proceed to next question
      });
    } else {
      rl.close(); // Close readline interface once all questions are asked
      console.log("Collected Answers:", collectedAnswers); // Log all collected answers
    }
  };

  handleNextQuestion(); // Start the process
}

// Sample questions to be prompted to the user
const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'What is your name?',
    default: 'User' // Default answer if none given
  },
  {
    type: 'confirm',
    name: 'continue',
    message: 'Do you want to continue?',
    default: 'yes' // Default answer if none given
  }
];

// Start asking the questions
askQuestions(questions);
