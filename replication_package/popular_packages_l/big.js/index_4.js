class Big {
  constructor(value) {
    if (Big.strict && (typeof value === 'number')) {
      throw new TypeError('[big.js] Invalid number');
    }
    this._value = typeof value === 'string' ? value : String(value);
  }

  static strict = false;
  static DP = 20;
  static RM = 0; 

  static roundHalfUp(number, decimalPlaces) {
    const factor = 10 ** decimalPlaces;
    return Math.round(number * factor) / factor;
  }

  toNumber() {
    const numValue = Number(this._value);
    if (Big.strict && !Big._isPrecise(this._value, numValue)) {
      throw new Error('[big.js] Imprecise conversion');
    }
    return numValue;
  }

  plus(y) {
    const result = this.toNumber() + new Big(y).toNumber();
    return new Big(result);
  }

  minus(y) {
    const result = this.toNumber() - new Big(y).toNumber();
    return new Big(result);
  }

  times(y) {
    const result = this.toNumber() * new Big(y).toNumber();
    return new Big(result);
  }

  div(y) {
    const quotient = this.toNumber() / new Big(y).toNumber();
    return new Big(Big.roundHalfUp(quotient, Big.DP));
  }

  eq(y) {
    return this.toNumber() === new Big(y).toNumber();
  }

  gt(y) {
    return this.toNumber() > new Big(y).toNumber();
  }

  sqrt() {
    const sqrtValue = Math.sqrt(this.toNumber());
    return new Big(Big.roundHalfUp(sqrtValue, Big.DP));
  }

  pow(exp) {
    const powValue = Math.pow(this.toNumber(), exp);
    return new Big(Big.roundHalfUp(powValue, Big.DP));
  }

  toFixed(dp) {
    return this.toNumber().toFixed(dp);
  }

  toExponential(dp) {
    return this.toNumber().toExponential(dp);
  }

  toPrecision(dp) {
    return this.toNumber().toPrecision(dp);
  }
  
  get c() {
    return [...this._value.replace('.', '')].map(Number);
  }

  get e() {
    return this._value.includes('.') ? this._value.indexOf('.') - 1 : this._value.length - 1;
  }

  get s() {
    return this._value.startsWith('-') ? -1 : 1;
  }

  static _isPrecise(initialValue, convertedValue) {
    const tolerance = 1e-15;
    return Math.abs(Number(initialValue) - convertedValue) < tolerance;
  }
}

module.exports = Big;
