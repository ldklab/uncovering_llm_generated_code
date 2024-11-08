class BigNumber {
  constructor(value, base = 10) {
    this.value = BigInt(convertBaseToDecimal(value, base));
  }

  add(other) {
    return new BigNumber((this.value + (other instanceof BigNumber ? other.value : BigInt(other))).toString());
  }

  subtract(other) {
    return new BigNumber((this.value - (other instanceof BigNumber ? other.value : BigInt(other))).toString());
  }

  multiply(other) {
    return new BigNumber((this.value * (other instanceof BigNumber ? other.value : BigInt(other))).toString());
  }

  toString(base = 10) {
    return this.value.toString(base);
  }

  equals(other) {
    return this.value === other.value;
  }

  lessThan(other) {
    return this.value < other.value;
  }

  greaterThan(other) {
    return this.value > other.value;
  }

  bitwiseAnd(other) {
    return new BigNumber((this.value & other.value).toString());
  }

  clone() {
    return new BigNumber(this.value.toString());
  }
}

function convertBaseToDecimal(input, base) {
  if (base === 2) return parseInt(input, 2).toString();
  if (base === 16) return parseInt(input, 16).toString();
  return input.toString();
}

// Example usage
const num1 = new BigNumber('dead', 16);
const num2 = new BigNumber('101010', 2);
const result = num1.add(num2);
console.log(result.toString(10));  // Output: 57047
