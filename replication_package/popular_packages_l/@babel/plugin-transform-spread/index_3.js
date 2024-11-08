// Function that adds three numbers together
function sum(a, b, c) {
  return a + b + c;
}

// Array of numbers to sum
const values = [1, 2, 3];

// Unpack array into individual arguments and print the sum
console.log(sum(...values));
