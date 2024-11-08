// elliptic.js

const elliptic = require('elliptic');
const { BN } = require('bn.js');

class Elliptic {
  constructor(curve) {
    this.curveName = curve;
    this.curve = new elliptic.ec(curve);
  }

  generateKeyPair() {
    return this.curve.genKeyPair();
  }

  signMessage(key, messageHash) {
    return key.sign(messageHash);
  }

  verifySignature(publicKey, messageHash, signature) {
    return publicKey.verify(messageHash, signature);
  }

  deriveSharedSecret(privateKey, publicKey) {
    return privateKey.derive(publicKey);
  }

  getPublicKeyFormats(key) {
    const pubPoint = key.getPublic();
    const x = pubPoint.getX();
    const y = pubPoint.getY();

    const hexFormat = pubPoint.encode('hex');
    const objectHexFormat = { x: x.toString('hex'), y: y.toString('hex') };
    const objectBufferFormat = { x: x.toBuffer(), y: y.toBuffer() };
    const arrayBufferFormat = { x: x.toArrayLike(Buffer), y: y.toArrayLike(Buffer) };

    return [hexFormat, objectHexFormat, objectBufferFormat, arrayBufferFormat];
  }

  importPublicKey(publicKey) {
    return this.curve.keyFromPublic(publicKey, 'hex');
  }
}

const secp256k1 = new Elliptic('secp256k1');
const messageHash = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const keyPair = secp256k1.generateKeyPair();
const signature = secp256k1.signMessage(keyPair, messageHash);
console.log(secp256k1.verifySignature(keyPair, messageHash, signature.toDER()));

module.exports = Elliptic;
