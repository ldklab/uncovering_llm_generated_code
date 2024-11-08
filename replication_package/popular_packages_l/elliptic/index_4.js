// ellipticHandler.js

const elliptic = require('elliptic');
const { BN } = require('bn.js');

class EllipticHandler {
  constructor(curveType) {
    this.curveType = curveType;
    this.curveInstance = new elliptic.ec(curveType);
  }

  // Create a new key pair
  createKeyPair() {
    return this.curveInstance.genKeyPair();
  }

  // Sign a hash with private key
  generateSignature(keyPair, messageHash) {
    return keyPair.sign(messageHash);
  }

  // Validate the signature of a hash
  validateSignature(publicKey, messageHash, signature) {
    return publicKey.verify(messageHash, signature);
  }

  // Perform Elliptic Curve Diffie-Hellman (ECDH)
  deriveSharedSecret(privateKey, otherPublicKey) {
    return privateKey.derive(otherPublicKey);
  }

  // Get public key in various formats
  getPublicKeyFormats(keyPair) {
    const publicKeyPoint = keyPair.getPublic();
    return {
      hexFormat: publicKeyPoint.encode('hex'),
      hexObject: {
        x: publicKeyPoint.getX().toString('hex'),
        y: publicKeyPoint.getY().toString('hex'),
      },
      bufferObject: {
        x: publicKeyPoint.getX().toBuffer(),
        y: publicKeyPoint.getY().toBuffer(),
      },
      arrayBuffer: {
        x: publicKeyPoint.getX().toArrayLike(Buffer),
        y: publicKeyPoint.getY().toArrayLike(Buffer),
      }
    };
  }

  // Convert a public key from its representation to a usable key object
  convertToPublicKey(publicKeyRep) {
    return this.curveInstance.keyFromPublic(publicKeyRep, 'hex');
  }
}

const secp256k1Instance = new EllipticHandler('secp256k1');
const exampleMessageHash = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Example operations
const generatedKeyPair = secp256k1Instance.createKeyPair();
const signature = secp256k1Instance.generateSignature(generatedKeyPair, exampleMessageHash);
console.log(secp256k1Instance.validateSignature(generatedKeyPair, exampleMessageHash, signature.toDER()));

module.exports = EllipticHandler;
