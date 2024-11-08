'use strict';

exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;

const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const revLookup = new Array(256).fill(-1);
for (let i = 0; i < lookup.length; i++) {
  revLookup[lookup.charCodeAt(i)] = i;
}
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

const Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

function getLens(b64) {
  const len = b64.length;
  if (len % 4 > 0) throw new Error('Invalid string. Length must be a multiple of 4');
  const validLen = b64.indexOf('=') !== -1 ? b64.indexOf('=') : len;
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
  const [validLen, placeHoldersLen] = getLens(b64);
  const arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  let curByte = 0;
  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  for (let i = 0; i < len; i += 4) {
    const tmp = (
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    );
    arr[curByte++] = (tmp >> 16) & 0xFF;
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    const tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xFF;
  } else if (placeHoldersLen === 1) {
    const tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
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
    const tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  const extraBytes = uint8.length % 3;
  const parts = [];
  const maxChunkLength = 16383;
  
  for (let i = 0, len2 = uint8.length - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, Math.min(i + maxChunkLength, len2)));
  }

  if (extraBytes === 1) {
    const tmp = uint8[uint8.length - 1];
    parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3F] + '==');
  } else if (extraBytes === 2) {
    const tmp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
    parts.push(lookup[tmp >> 10] + lookup[(tmp >> 4) & 0x3F] + lookup[(tmp << 2) & 0x3F] + '=');
  }

  return parts.join('');
}
