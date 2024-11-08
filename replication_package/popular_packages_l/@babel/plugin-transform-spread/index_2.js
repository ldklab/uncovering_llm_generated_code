// Function to calculate the sum of three numbers
function sum(a, b, c) {
  return a + b + c; // Returns the sum of the provided arguments
}

// Array containing three numbers
const nums = [1, 2, 3];

// Call the sum function with the spread operator to unpack array elements as arguments
const result = sum(...nums);

// Output the result to the console
console.log(result); // Expected output: 6
