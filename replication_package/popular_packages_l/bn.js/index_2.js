class BigNumber {
  constructor(value, base = 10) {
    this.value = BigInt(convertInputToDecimal(value, base));
  }

  // Basic arithmetic operations
  add(other) {
    const otherValue = other instanceof BigNumber ? other.value : BigInt(other);
    return new BigNumber((this.value + otherValue).toString());
  }

  subtract(other) {
    const otherValue = other instanceof BigNumber ? other.value : BigInt(other);
    return new BigNumber((this.value - otherValue).toString());
  }

  multiply(other) {
    const otherValue = other instanceof BigNumber ? other.value : BigInt(other);
    return new BigNumber((this.value * otherValue).toString());
  }

  // Convert to string
  toString(base = 10) {
    return this.value.toString(base);
  }

  // Comparison methods
  equals(other) {
    return this.value === other.value;
  }

  lessThan(other) {
    return this.value < other.value;
  }

  greaterThan(other) {
    return this.value > other.value;
  }

  // Bitwise operations
  and(other) {
    return new BigNumber((this.value & other.value).toString());
  }

  // Clone method
  clone() {
    return new BigNumber(this.value.toString());
  }
}

// Helper function to convert binary/hexadecimal to decimal
function convertInputToDecimal(input, base) {
  if (base === 2) return parseInt(input, 2).toString();
  if (base === 16) return parseInt(input, 16).toString();
  return input.toString();
}

// Usage example
const numberA = new BigNumber('dead', 16);
const numberB = new BigNumber('101010', 2);
const result = numberA.add(numberB);
console.log(result.toString(10));  // Output: 57047
