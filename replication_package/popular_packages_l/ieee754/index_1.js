// ieee754.js
function readIEEE754(buffer, offset, isLE, mLen, nBytes) {
  let exponent, mantissa;
  const exponentBits = (nBytes * 8) - mLen - 1;
  const maxExponent = (1 << exponentBits) - 1;
  const exponentBias = maxExponent >> 1;
  let numBits = -7;
  let byteIndex = isLE ? nBytes - 1 : 0;
  const direction = isLE ? -1 : 1;
  let sign = buffer[offset + byteIndex];

  byteIndex += direction;

  exponent = sign & ((1 << (-numBits)) - 1);
  sign >>= (-numBits);
  numBits += exponentBits;
  while (numBits > 0) {
    exponent = (exponent * 256) + buffer[offset + byteIndex];
    byteIndex += direction;
    numBits -= 8;
  }

  mantissa = exponent & ((1 << (-numBits)) - 1);
  exponent >>= (-numBits);
  numBits += mLen;
  while (numBits > 0) {
    mantissa = (mantissa * 256) + buffer[offset + byteIndex];
    byteIndex += direction;
    numBits -= 8;
  }

  if (exponent === 0) {
    exponent = 1 - exponentBias;
  } else if (exponent === maxExponent) {
    return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
  } else {
    mantissa += Math.pow(2, mLen);
    exponent -= exponentBias;
  }
  return (sign ? -1 : 1) * mantissa * Math.pow(2, exponent - mLen);
}

function writeIEEE754(buffer, value, offset, isLE, mLen, nBytes) {
  let exponent, mantissa, compensation;
  const exponentBits = (nBytes * 8) - mLen - 1;
  const maxExponent = (1 << exponentBits) - 1;
  const exponentBias = maxExponent >> 1;
  const rounding = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  let byteIndex = isLE ? 0 : nBytes - 1;
  const direction = isLE ? 1 : -1;
  const sign = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    mantissa = isNaN(value) ? 1 : 0;
    exponent = maxExponent;
  } else {
    exponent = Math.floor(Math.log(value) / Math.LN2);
    compensation = Math.pow(2, -exponent);
    if (value * compensation < 1) {
      exponent--;
      compensation *= 2;
    }
    value += value * compensation < 2 ? rounding : 0;

    if (exponent + exponentBias >= maxExponent) {
      mantissa = 0;
      exponent = maxExponent;
    } else if (exponent + exponentBias >= 1) {
      mantissa = (value * compensation - 1) * Math.pow(2, mLen);
      exponent += exponentBias;
    } else {
      mantissa = value * Math.pow(2, exponentBias - 1) * Math.pow(2, mLen);
      exponent = 0;
    }
  }

  while (mLen >= 8) {
    buffer[offset + byteIndex] = mantissa & 0xff;
    byteIndex += direction;
    mantissa /= 256;
    mLen -= 8;
  }

  const encodedExponent = (exponent << mLen) | mantissa;
  let bitsAvailable = exponentBits + mLen;
  while (bitsAvailable > 0) {
    buffer[offset + byteIndex] = encodedExponent & 0xff;
    byteIndex += direction;
    exponent /= 256;
    bitsAvailable -= 8;
  }

  buffer[offset + byteIndex - direction] |= sign * 128;
}

module.exports = {
  read: readIEEE754,
  write: writeIEEE754
}
