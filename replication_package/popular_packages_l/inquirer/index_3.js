// Import necessary modules
const readline = require('readline');

// Create a readline interface for input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user with a question and handle the response via callback
function promptUser(questionText, callback) {
  rl.question(`${questionText}\n> `, (userResponse) => {
    callback(userResponse);
  });
}

// Function to manage and handle the sequence of questions
function executeQuestions(questionsList) {
  let currentQuestionIndex = 0;
  const collectedResponses = {};

  const cycleThroughQuestions = () => {
    if (currentQuestionIndex < questionsList.length) {
      const currentQuestion = questionsList[currentQuestionIndex];
      promptUser(currentQuestion.message, (userResponse) => {
        collectedResponses[currentQuestion.name] = userResponse || currentQuestion.default;
        currentQuestionIndex++;
        cycleThroughQuestions();
      });
    } else {
      rl.close();
      console.log("Collected Answers:", collectedResponses);
    }
  };

  cycleThroughQuestions();
}

// Define questions array with prompts and default answers
const inquiry = [
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

// Start the questioning process
executeQuestions(inquiry);
