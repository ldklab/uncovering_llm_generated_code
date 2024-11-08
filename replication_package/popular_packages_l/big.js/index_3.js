class Big {
  constructor(value) {
    // Check for strict mode and throw error if 'value' is a number
    if (Big.strict && (typeof value === 'number')) {
      throw new TypeError('[big.js] Invalid number');
    }
    // Store the value as a string
    this._value = typeof value === 'string' ? value : value.toString();
  }

  // Static properties for precision and rounding
  static strict = false;
  static DP = 20;
  static RM = 0; // 0: round down, 1: round half-up

  // Method to round number half up to specified decimal places
  static roundHalfUp(x, dp) {
    const pow = Math.pow(10, dp);
    return Math.round(x * pow) / pow;
  }

  // Convert the stored value to a number
  toNumber() {
    const n = Number(this._value);
    if (Big.strict && !Big._isPrecise(this._value, n)) {
      throw new Error('[big.js] Imprecise conversion');
    }
    return n;
  }

  // Addition of two Big instance values
  plus(y) {
    return new Big(this.toNumber() + new Big(y).toNumber());
  }

  // Subtraction of two Big instance values
  minus(y) {
    return new Big(this.toNumber() - new Big(y).toNumber());
  }

  // Multiplication of two Big instance values
  times(y) {
    return new Big(this.toNumber() * new Big(y).toNumber());
  }

  // Division of two Big instance values with rounding
  div(y) {
    const quotient = this.toNumber() / new Big(y).toNumber();
    return new Big(Big.roundHalfUp(quotient, Big.DP));
  }

  // Equality check between two Big instance values
  eq(y) {
    return this.toNumber() === new Big(y).toNumber();
  }

  // Greater than comparison between two Big instance values
  gt(y) {
    return this.toNumber() > new Big(y).toNumber();
  }

  // Square root of the Big instance value
  sqrt() {
    const sqrtValue = Math.sqrt(this.toNumber());
    return new Big(Big.roundHalfUp(sqrtValue, Big.DP));
  }

  // Power function for the Big instance value
  pow(exp) {
    const powValue = Math.pow(this.toNumber(), exp);
    return new Big(Big.roundHalfUp(powValue, Big.DP));
  }

  // Convert the number to fixed decimal representation
  toFixed(dp) {
    return this.toNumber().toFixed(dp);
  }

  // Convert the number to exponential representation
  toExponential(dp) {
    return this.toNumber().toExponential(dp);
  }

  // Convert the number to a specific precision
  toPrecision(dp) {
    return this.toNumber().toPrecision(dp);
  }

  // Retrieve coefficient digits of the number
  get c() {
    return Array.from(this._value.replace('.', '')).map(digit => parseInt(digit, 10));
  }

  // Determine the exponent from the position of the decimal point
  get e() {
    return this._value.includes('.') ? this._value.indexOf('.') - 1 : this._value.length - 1;
  }

  // Check for the sign of the number
  get s() {
    return this._value.startsWith('-') ? -1 : 1;
  }

  // Static method for checking precision loss
  static _isPrecise(initialValue, convertedValue) {
    const delta = 1e-15; // Precision tolerance
    return Math.abs(Number(initialValue) - convertedValue) < delta;
  }
}

module.exports = Big;
