// Import the readline module to handle command line input and output operations
const readline = require('readline');

// Create an interface for reading and writing with the command line
const rl = readline.createInterface({
  input: process.stdin,  // Set the input stream
  output: process.stdout // Set the output stream
});

// Function to prompt the user with a question and process the response
function prompt(question, callback) {
  rl.question(`${question}\n> `, (answer) => {
    callback(answer); // Pass the user's answer to the callback function
  });
}

// Function to handle iterating over and asking multiple questions
function askQuestions(questions) {
  let index = 0; // Initialize question index
  const answers = {}; // Initialize an object to collect answers

  // Function to process the current question
  const processQuestion = () => {
    // Check if there are more questions to ask
    if (index < questions.length) {
      const question = questions[index]; // Get the current question object
      // Prompt the user with the question and handle the answer
      prompt(`${question.message}`, (answer) => {
        // Store the answer in the answers object with the question's name
        answers[question.name] = answer || question.default;
        index++; // Move to the next question
        processQuestion(); // Recursively ask the next question
      });
    } else {
      // When all questions are answered
      rl.close(); // Close the readline interface
      console.log("Collected Answers:", answers); // Output all collected answers
    }
  };

  processQuestion(); // Start the questioning process
}

// Define an array of questions with properties such as type, name, message, and default value
const questions = [
  {
    type: 'input',   // Type of input expected
    name: 'name',    // Name of the field for collecting answer
    message: 'What is your name?',  // Question text
    default: 'User'  // Default answer if none is provided
  },
  {
    type: 'confirm', // Type of input expected
    name: 'continue', // Name of the field for collecting answer
    message: 'Do you want to continue?', // Question text
    default: 'yes'   // Default answer if none is provided
  }
];

// Begin asking the defined questions
askQuestions(questions);
