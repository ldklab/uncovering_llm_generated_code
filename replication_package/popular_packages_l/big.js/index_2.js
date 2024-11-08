class BigNumber {
  constructor(value) {
    if (BigNumber.strictModeEnabled && typeof value === 'number') {
      throw new TypeError('[BigNumber] Invalid number');
    }
    this._value = typeof value === 'string' ? value : value.toString();
  }

  static strictModeEnabled = false;
  static decimalPlaces = 20;
  static roundingMode = 0; // 0: round down, 1: round half-up

  static roundToPrecision(x, dp) {
    const factor = Math.pow(10, dp);
    return Math.round(x * factor) / factor;
  }

  toNumber() {
    const num = Number(this._value);
    if (BigNumber.strictModeEnabled && !BigNumber._isConversionPrecise(this._value, num)) {
      throw new Error('[BigNumber] Imprecise conversion');
    }
    return num;
  }

  add(y) {
    return new BigNumber(this.toNumber() + new BigNumber(y).toNumber());
  }

  subtract(y) {
    return new BigNumber(this.toNumber() - new BigNumber(y).toNumber());
  }

  multiply(y) {
    return new BigNumber(this.toNumber() * new BigNumber(y).toNumber());
  }

  divide(y) {
    const result = this.toNumber() / new BigNumber(y).toNumber();
    return new BigNumber(BigNumber.roundToPrecision(result, BigNumber.decimalPlaces));
  }

  isEqualTo(y) {
    return this.toNumber() === new BigNumber(y).toNumber();
  }

  isGreaterThan(y) {
    return this.toNumber() > new BigNumber(y).toNumber();
  }

  squareRoot() {
    const sqrtResult = Math.sqrt(this.toNumber());
    return new BigNumber(BigNumber.roundToPrecision(sqrtResult, BigNumber.decimalPlaces));
  }

  power(exp) {
    const powerResult = Math.pow(this.toNumber(), exp);
    return new BigNumber(BigNumber.roundToPrecision(powerResult, BigNumber.decimalPlaces));
  }

  toFixedFormat(dp) {
    return this.toNumber().toFixed(dp);
  }

  toExponentialFormat(dp) {
    return this.toNumber().toExponential(dp);
  }

  toPrecisionFormat(dp) {
    return this.toNumber().toPrecision(dp);
  }

  get coefficient() {
    return Array.from(this._value.replace('.', '')).map(digit => parseInt(digit, 10));
  }

  get exponent() {
    return this._value.includes('.') ? this._value.indexOf('.') - 1 : this._value.length - 1;
  }

  get sign() {
    return this._value.startsWith('-') ? -1 : 1;
  }

  static _isConversionPrecise(initialValue, convertedValue) {
    const tolerance = 1e-15;
    return Math.abs(Number(initialValue) - convertedValue) < tolerance;
  }
}

module.exports = BigNumber;
