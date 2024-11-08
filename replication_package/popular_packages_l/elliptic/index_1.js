const elliptic = require('elliptic');

class Elliptic {
  constructor(curve) {
    this.curve = new elliptic.ec(curve);
  }

  genKeyPair() {
    return this.curve.genKeyPair();
  }

  sign(key, msgHash) {
    return key.sign(msgHash);
  }

  verify(key, msgHash, signature) {
    return key.verify(msgHash, signature);
  }

  ecdh(key1, pubKey2) {
    return key1.derive(pubKey2);
  }

  encodePublicKey(key) {
    const pubPoint = key.getPublic();
    const x = pubPoint.getX(), y = pubPoint.getY();

    return [
      pubPoint.encode('hex'),
      { x: x.toString('hex'), y: y.toString('hex') },
      { x: x.toBuffer(), y: y.toBuffer() },
      { x: x.toArrayLike(Buffer), y: y.toArrayLike(Buffer) }
    ];
  }

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
