// bignumber.js - A library for arbitrary-precision decimal and non-decimal arithmetic

class BigNumber {
  constructor(value, base) {
    // Initializes from a string or number
    // Converts value to a string and parse it according to the base if provided
    this.coefficient = BigNumber.parseCoefficient(value, base);
    this.exponent = BigNumber.calculateExponent(value);
    this.sign = Math.sign(value);
  }

  // Static method to parse coefficient
  static parseCoefficient(value, base = 10) {
    // Implement parsing logic for coefficients, considering the base
    return String(value).split('.').map(num => parseInt(num, base));
  }

  // Static method to calculate exponent
  static calculateExponent(value) {
    // Calculate the exponent for the value
    return Math.floor(Math.log10(Math.abs(value)));
  }

  // Arithmetic operation methods
  add(y) {
    // Add y to this BigNumber
    return new BigNumber(this.toNumeric() + this.parseValue(y));
  }

  subtract(y) {
    // Subtract y from this BigNumber
    return new BigNumber(this.toNumeric() - this.parseValue(y));
  }

  multiply(y) {
    // Multiply this BigNumber by y
    return new BigNumber(this.toNumeric() * this.parseValue(y));
  }

  divide(y) {
    // Divide this BigNumber by y
    return new BigNumber(this.toNumeric() / this.parseValue(y));
  }

  // Additional methods following similar implementations
  sqrt() {
    return new BigNumber(Math.sqrt(this.toNumeric()));
  }

  formatDecimal(places = 0) {
    return this.toNumeric().toFixed(places);
  }

  toBaseString(base = 10) {
    // Convert BigNumber to string in specified base
    return this.toNumeric().toString(base);
  }

  toFraction(maxDenominator = 1000) {
    // Convert BigNumber to a fraction with an optional maximum denominator
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    let numerator = this.toNumeric(), denominator = 1;
    while ((numerator % 1) !== 0 && denominator < maxDenominator) {
      numerator *= 10;
      denominator *= 10;
    }
    const commonDivisor = gcd(numerator, denominator);
    return [numerator / commonDivisor, denominator / commonDivisor];
  }

  // Utility methods
  equals(y) {
    return this.toNumeric() === this.parseValue(y);
  }

  checkNaN() {
    return isNaN(this.toNumeric());
  }

  checkFinite() {
    return isFinite(this.toNumeric());
  }

  // Internal helper
  parseValue(value) {
    return (value instanceof BigNumber) ? value.toNumeric() : BigNumber(value).toNumeric();
  }

  // Coercion to primitive numeric type
  toNumeric() {
    return parseFloat(this.coefficient.join('')) * Math.pow(10, this.exponent);
  }
}

// Sample configuration methods
BigNumber.setConfiguration = function(config) {
  // Extend for setting global configuration
}

BigNumber.createCopy = function(config) {
  return new BigNumber(); // Initialize new instance with config
}

module.exports = BigNumber;
