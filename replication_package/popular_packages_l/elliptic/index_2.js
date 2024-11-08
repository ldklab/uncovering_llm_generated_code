// elliptic.js

const elliptic = require('elliptic');
const { BN } = require('bn.js');

class Elliptic {
  constructor(curve) {
    this.curveName = curve;
    this.curve = new elliptic.ec(curve);
  }

  // Generate key pair for the given curve
  genKeyPair() {
    return this.curve.genKeyPair();
  }

  // Sign a message hash with the given private key
  sign(key, msgHash) {
    return key.sign(msgHash);
  }

  // Verify a signature for a given message hash
  verify(key, msgHash, signature) {
    return key.verify(msgHash, signature);
  }

  // ECDH: Derive a shared secret
  ecdh(key1, pubKey2) {
    return key1.derive(pubKey2);
  }

  // Encode the public key to different formats
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

  // Import public key in different formats
  importPublicKey(pub) {
    return this.curve.keyFromPublic(pub, 'hex');
  }
}

// Instantiate Elliptic using the secp256k1 curve
const secp256k1 = new Elliptic('secp256k1');
const msgHash = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Example usage: Key generation, signing, and verification
const key = secp256k1.genKeyPair();
const signature = secp256k1.sign(key, msgHash);
console.log(secp256k1.verify(key, msgHash, signature.toDER()));

module.exports = Elliptic;
