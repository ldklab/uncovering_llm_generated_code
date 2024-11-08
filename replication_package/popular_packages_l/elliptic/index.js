// elliptic.js

const elliptic = require('elliptic');
const { BN } = require('bn.js');
const createHash = require('hash.js');

class Elliptic {
  constructor(curve) {
    this.curveName = curve;
    this.curve = new elliptic.ec(curve);
  }

  /**
   * Generate key pair for the given curve.
   */
  genKeyPair() {
    return this.curve.genKeyPair();
  }

  /**
   * Sign a message hash with the given private key.
   * @param {Object} key - The key pair.
   * @param {Array|Buffer} msgHash - The message hash.
   * @returns {Object} - The signature object
   */
  sign(key, msgHash) {
    return key.sign(msgHash);
  }

  /**
   * Verify a signature for a given message hash.
   * @param {Object} key - The public key.
   * @param {Array|Buffer} msgHash - The message hash.
   * @param {Object|String|Buffer} signature - The signature.
   * @returns {Boolean} - True if valid, false otherwise
   */
  verify(key, msgHash, signature) {
    return key.verify(msgHash, signature);
  }

  /**
   * ECDH: Derive a shared secret.
   * @param {Object} key1 - The first key pair.
   * @param {Object} pubKey2 - The public part of the second key pair.
   * @returns {BN} - The derived shared secret.
   */
  ecdh(key1, pubKey2) {
    return key1.derive(pubKey2);
  }

  /**
   * Encode the public key to different formats.
   * @param {Object} key - Key pair to get the public key from.
   * @returns {Array} - Different formats of the public keys.
   */
  encodePublicKey(key) {
    const pubPoint = key.getPublic();
    const x = pubPoint.getX();
    const y = pubPoint.getY();

    const hex = pubPoint.encode('hex');
    const objHex = { x: x.toString('hex'), y: y.toString('hex') };
    const objBuf = { x: x.toBuffer(), y: y.toBuffer() };
    const arrBuf = { x: x.toArrayLike(Buffer), y: y.toArrayLike(Buffer) };

    return [hex, objHex, objBuf, arrBuf];
  }

  /**
   * Import public key in different formats.
   * @param {String|Object} pub - Public key in various formats.
   * @returns {Object} - The key object.
   */
  importPublicKey(pub) {
    return this.curve.keyFromPublic(pub, 'hex');
  }
}

const secp256k1 = new Elliptic('secp256k1');
const msgHash = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Example: Key generation, signing, and verification
const key = secp256k1.genKeyPair();
const signature = secp256k1.sign(key, msgHash);
console.log(secp256k1.verify(key, msgHash, signature.toDER()));

module.exports = Elliptic;
