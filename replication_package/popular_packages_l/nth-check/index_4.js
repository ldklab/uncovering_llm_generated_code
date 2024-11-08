// nth-check.js

// This function parses an nth-child formula into its components
// The formula like "2n+3" is split into parts: a multiplier for n (a) and an offset (b).
function parse(formula) {
  // Use regex to extract the parts of the formula
  const match = formula.match(/^((?:-?\d*)?n)?\s*(?:\+?\s*(\d+))?$/);
  
  // If no parts were matched, the formula is invalid
  if (!match) throw new Error("Invalid formula");

  // Parse the matched parts into integers, defaulting to 0 if non-existent
  let a = parseInt(match[1], 10) || 0;
  const b = parseInt(match[2], 10) || 0;

  // If both parts are zero, the input formula is invalid
  if (a === 0 && b === 0) throw new Error("Invalid formula");

  return [a, b]; // Return the tuple [a, b]
}

// This function compiles the nth-child values into a function
// The compiled function will tell if a given index is selected by the nth-child rule
function compile([a, b]) {
  return function(index) {
    // When a is zero, simply checks if the index equals b-1
    if (a === 0) return index === b - 1;
    
    // Otherwise, checks if the given index aligns with the formula
    return (index - (b - 1)) % a === 0 && (index - (b - 1)) / a >= 0;
  };
}

// Wrapper function to parse a formula and compile it into a checking function
function nthCheck(formula) {
  return compile(parse(formula));
}

// Generates the sequence of indices that match the formula
function generate([a, b]) {
  let current = b - 1; // Initialize the current index
  return function() {
    if (a === 0) {
      return current++ === current ? null : current; 
    }
    
    const result = current;
    current += a; // Move to the next index in the sequence
    
    // Return the current index if valid, else return null
    if ((a > 0 && result >= 0) || (a < 0 && result > 0)) {
      return result;
    }
    return null; 
  };
}

// Wrapper function to parse a formula and generate its sequence of indices
function sequence(formula) {
  return generate(parse(formula));
}

export { nthCheck, parse, compile, generate, sequence };
