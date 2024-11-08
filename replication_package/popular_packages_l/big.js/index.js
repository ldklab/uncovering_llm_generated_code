class Big {
  constructor(value) {
    if (Big.strict && (typeof value === 'number')) {
      throw new TypeError('[big.js] Invalid number');
    }
    this._value = typeof value === 'string' ? value : value.toString();
  }

  static strict = false;
  static DP = 20;
  static RM = 0; // 0: round down, 1: round half-up

  static roundHalfUp(x, dp) {
    const pow = Math.pow(10, dp);
    return Math.round(x * pow) / pow;
  }

  toNumber() {
    const n = Number(this._value);
    if (Big.strict && !Big._isPrecise(this._value, n)) {
      throw new Error('[big.js] Imprecise conversion');
    }
    return n;
  }

  plus(y) {
    return new Big(this.toNumber() + new Big(y).toNumber());
  }

  minus(y) {
    return new Big(this.toNumber() - new Big(y).toNumber());
  }

  times(y) {
    return new Big(this.toNumber() * new Big(y).toNumber());
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
    return Array.from(this._value.replace('.', ''))
                .map(digit => parseInt(digit, 10));
  }

  get e() {
    return this._value.includes('.') ? this._value.indexOf('.') - 1 : this._value.length - 1;
  }

  get s() {
    return this._value.startsWith('-') ? -1 : 1;
  }

  static _isPrecise(initialValue, convertedValue) {
    const delta = 1e-15; // Precision tolerance
    return Math.abs(Number(initialValue) - convertedValue) < delta;
  }
}

module.exports = Big;
