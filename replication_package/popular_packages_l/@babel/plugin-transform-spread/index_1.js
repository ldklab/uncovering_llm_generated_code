// Function to sum three numbers
function sum(x, y, z) {
  return x + y + z; // Return the sum of the three arguments
}

// Array containing numbers to be summed
const numbers = [1, 2, 3];

// Log the result of the sum function, spreading the array elements as arguments
console.log(sum(...numbers)); // Outputs: 6
