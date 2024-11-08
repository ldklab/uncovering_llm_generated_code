class BN {
  constructor(number, base = 10) {
    this.number = BigInt(binHexDecToDec(number, base));
  }

  // Basic arithmetic operations
  add(b) {
    return new BN((this.number + (b instanceof BN ? b.number : BigInt(b))).toString());
  }

  sub(b) {
    return new BN((this.number - (b instanceof BN ? b.number : BigInt(b))).toString());
  }

  mul(b) {
    return new BN((this.number * (b instanceof BN ? b.number : BigInt(b))).toString());
  }

  // Util methods
  toString(base = 10) {
    return this.number.toString(base);
  }

  // Comparison methods
  eq(b) {
    return this.number === b.number;
  }

  lt(b) {
    return this.number < b.number;
  }

  gt(b) {
    return this.number > b.number;
  }

  // Bitwise operations
  and(b) {
    return new BN((this.number & b.number).toString());
  }

  // Clone method
  clone() {
    return new BN(this.number.toString());
  }
}

// Helper function to convert binary/hexadecimal to decimal
function binHexDecToDec(input, base) {
  if (base === 2) return parseInt(input, 2).toString();
  if (base === 16) return parseInt(input, 16).toString();
  return input.toString();
}

// Usage example
const a = new BN('dead', 16);
const b = new BN('101010', 2);
const res = a.add(b);
console.log(res.toString(10));  // Output: 57047
