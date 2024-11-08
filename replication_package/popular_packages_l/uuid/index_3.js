// uuid.js
import crypto from 'crypto';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';
const MAX_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const byteToHex = Array.from({ length: 256 }, (_, i) => (i + 0x100).toString(16).substr(1));

function rng() {
  return crypto.randomBytes(16);
}

function stringify(arr, offset = 0) {
  return [
    byteToHex[arr[offset++]], byteToHex[arr[offset++]],
    byteToHex[arr[offset++]], byteToHex[arr[offset++]], '-',
    byteToHex[arr[offset++]], byteToHex[arr[offset++]], '-',
    byteToHex[arr[offset++]], byteToHex[arr[offset++]], '-',
    byteToHex[arr[offset++]], byteToHex[arr[offset++]], '-',
    byteToHex[arr[offset++]], byteToHex[arr[offset++]],
    byteToHex[arr[offset++]], byteToHex[arr[offset++]],
    byteToHex[arr[offset++]], byteToHex[arr[offset++]]
  ].join('');
}

function parse(uuid) {
  const arr = new Uint8Array(16);
  let v;
  for (let i = 0, j = 0; i < 36; ++i) {
    if (uuid[i] === '-') continue;
    v = parseInt(uuid[i], 16);
    arr[j >> 1] |= (i & 1) ? v : v << 4;
    j++;
  }
  return arr;
}

function v4(options = {}, buf, offset = 0) {
  const b = buf || new Array(16);
  options.random = options.random || options.rng || rng();

  b[offset] = options.random[0] | 0x40;
  for (let x = 1; x < 16; ++x) {
    b[offset + x] = options.random[x] | 0x80 >> ((x & 0x03) << 1);
  }
  return buf ? buf : stringify(b);
}

function validate(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8]{1}[0-9a-f]{3}-[89ab]{1}[0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function version(uuid) {
  if (!validate(uuid)) throw new TypeError('Invalid UUID');
  return parseInt(uuid.substr(14, 1), 16);
}

const v1 = () => {}; // ToDo: Implement function
const v3 = () => {}; // ToDo: Implement function
const v5 = () => {}; // ToDo: Implement function
const v6 = () => {}; // ToDo: Implement function
const v1ToV6 = () => {}; // ToDo: Implement function
const v6ToV1 = () => {}; // ToDo: Implement function
const v7 = () => {}; // ToDo: Implement function

export {
  NIL_UUID,
  MAX_UUID,
  stringify,
  parse,
  v1,
  v3,
  v4,
  v5,
  v6,
  v1ToV6,
  v6ToV1,
  v7,
  validate,
  version
};
