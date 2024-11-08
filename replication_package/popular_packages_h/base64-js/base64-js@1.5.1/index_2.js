'use strict';

exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;

const lookup = [];
const revLookup = [];
const Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

const code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (let i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64) {
  const len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }
  
  let validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;

  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

function byteLength(b64) {
  const [validLen, placeHoldersLen] = getLens(b64);
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}

function _byteLength(b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}

function toByteArray(b64) {
  const lens = getLens(b64);
  const validLen = lens[0];
  const placeHoldersLen = lens[1];

  const arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  let curByte = 0;

  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  for (let i = 0; i < len; i += 4) {
    let tmp = (revLookup[b64.charCodeAt(i)] << 18) |
              (revLookup[b64.charCodeAt(i + 1)] << 12) |
              (revLookup[b64.charCodeAt(i + 2)] << 6) |
              revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xFF;
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    let tmp = (revLookup[b64.charCodeAt(i)] << 2) |
              (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    let tmp = (revLookup[b64.charCodeAt(i)] << 10) |
              (revLookup[b64.charCodeAt(i + 1)] << 4) |
              (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] +
         lookup[num >> 12 & 0x3F] +
         lookup[num >> 6 & 0x3F] +
         lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  const output = [];
  for (let i = start; i < end; i += 3) {
    let tmp = ((uint8[i] << 16) & 0xFF0000) +
              ((uint8[i + 1] << 8) & 0xFF00) +
              (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  const len = uint8.length;
  const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  const parts = [];
  const maxChunkLength = 16383; // must be multiple of 3

  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  if (extraBytes === 1) {
    let tmp = uint8[len - 1];
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    );
  } else if (extraBytes === 2) {
    let tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    );
  }

  return parts.join('');
}
