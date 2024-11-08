class WebIDLConversions {
  static boolean(value) {
    return Boolean(value);
  }

  static unsignedLong(value, { enforceRange = false, clamp = false } = {}) {
    let convertedValue = Number(value);
    const maxULong = 2 ** 32 - 1;

    if (enforceRange && (convertedValue < 0 || convertedValue > maxULong)) {
      throw new TypeError(`Value out of range for unsigned long`);
    }

    if (clamp) {
      convertedValue = Math.max(0, Math.min(convertedValue, maxULong));
    }

    if (!isFinite(convertedValue) || isNaN(convertedValue)) {
      return 0;
    }

    return Math.trunc(convertedValue);
  }

  static float(value, { context = "Value" } = {}) {
    const convertedValue = Number(value);

    if (!isFinite(convertedValue)) {
      throw new TypeError(`${context} is not a finite floating-point value.`);
    }

    return convertedValue;
  }

  static DOMString(value, { treatNullAsEmptyString = false } = {}) {
    return (treatNullAsEmptyString && value === null) ? '' : String(value);
  }
}

module.exports = WebIDLConversions;

function doStuff(x, y) {
  x = WebIDLConversions.boolean(x);
  y = WebIDLConversions.unsignedLong(y);
  // Your actual algorithm code here
}
