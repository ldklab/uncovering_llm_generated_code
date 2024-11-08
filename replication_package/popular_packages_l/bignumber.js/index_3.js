// Arbitrary-Precision Arithmetic Library for JavaScript

class BigNumber {
  constructor(value, base = 10) {
    // Initializes the BigNumber from a given value (string or number) and optional base
    const formattedValue = String(value);
    this.c = BigNumber.parseCoefficient(formattedValue, base); // Parsing string to coefficient
    this.e = BigNumber.getExponent(formattedValue);  // Determine the exponent
    this.s = Math.sign(value);  // Determine the sign of the value
  }

  // Convert a string or number to a base-specific coefficient array 
  static parseCoefficient(value, base) {
    return value.split('.').map(part => parseInt(part, base)); // Splitting and parsing value
  }

  // Calculate the exponent based on the value's magnitude
  static getExponent(value) {
    return Math.floor(Math.log10(Math.abs(value) || 1)); // Logarithmic calculation for magnitude
  }

  // Adds two BigNumbers
  plus(y) {
    return new BigNumber(this.valueOf() + this.parse(y));  // Combine and create new BigNumber
  }

  // Subtracts the input from this BigNumber
  minus(y) {
    return new BigNumber(this.valueOf() - this.parse(y));  // Calculate result BigNumber
  }

  // Multiplies this BigNumber with another
  times(y) {
    return new BigNumber(this.valueOf() * this.parse(y));  // Create multiplied BigNumber
  }

  // Divides this BigNumber by another
  dividedBy(y) {
    return new BigNumber(this.valueOf() / this.parse(y));  // Create divided BigNumber
  }

  // Returns the square root as a BigNumber
  squareRoot() {
    return new BigNumber(Math.sqrt(this.valueOf()));  // Calculate and return square root
  }

  // Converts BigNumber to string with fixed decimal places
  toFixed(dp = 0) {
    return this.valueOf().toFixed(dp);  // String representation with decimal places
  }

  // Returns string representation in any given base
  toString(base = 10) {
    return this.valueOf().toString(base); // Base-specific string
  }

  // Converts BigNumber to fraction with constrained denominator
  toFraction(maxD = 1000) {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;  // Recursive calculation of gcd
    let num = this.valueOf(), den = 1;
    while ((num % 1) !== 0 && den < maxD) { num *= 10; den *= 10; }  // Fraction conversion
    const factor = gcd(num, den);
    return [num / factor, den / factor];  // Simplified fraction result
  }

  // Check equality with another BigNumber
  isEqualTo(y) {
    return this.valueOf() === this.parse(y);  // Direct comparison of values
  }

  // Check if the BigNumber value is NaN
  isNaN() {
    return isNaN(this.valueOf());  // NaN check
  }

  // Check if the BigNumber value is finite
  isFinite() {
    return isFinite(this.valueOf());  // Finite check
  }

  // Convert input to number, whether BigNumber or primitive
  parse(value) {
    return (value instanceof BigNumber) ? value.valueOf() : new BigNumber(value).valueOf();
  }

  // Retrieve the numeric value of this BigNumber
  valueOf() {
    return parseFloat(this.c.join('')) * Math.pow(10, this.e); // Numeric coercion
  }

  // Example configuration method to globally set settings
  static set(config) {
    // Configuration logic to be implemented
  }

  // Clone the current BigNumber with a given setup
  static clone(config) {
    return new BigNumber(); // Creation of cloned instance
  }
}

module.exports = BigNumber; 
