const crypto = require('crypto');
const { Readable, Writable } = require('stream');

const jws = {
  ALGORITHMS: [
    'HS256', 'HS384', 'HS512',
    'RS256', 'RS384', 'RS512',
    'PS256', 'PS384', 'PS512',
    'ES256', 'ES384', 'ES512',
    'none'
  ],

  sign({ header, payload, secret, privateKey, encoding = 'utf8' }) {
    if (!header || !header.alg || !this.ALGORITHMS.includes(header.alg)) {
      throw new Error('Invalid algorithm');
    }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)).toString('base64url');
    const signature = this._createSignature(encodedHeader, encodedPayload, secret || privateKey, header.alg);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  verify(signature, algorithm, secretOrKey) {
    const [encodedHeader, encodedPayload, signaturePart] = signature.split('.');
    if (!encodedHeader || !encodedPayload || !signaturePart) {
      return false;
    }
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    if (header.alg !== algorithm) {
      return false;
    }
    const expectedSignature = this._createSignature(encodedHeader, encodedPayload, secretOrKey, algorithm);
    return expectedSignature === signaturePart;
  },
  
  decode(signature) {
    const [encodedHeader, encodedPayload, signaturePart] = signature.split('.');
    return {
      header: JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')),
      payload: Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      signature: signaturePart
    };
  },

  createSign({ header, payload, privateKey, secret }) {
    const signStream = new SignStream(header, privateKey || secret);
    if (payload) {
      signStream.write(payload);
      signStream.end();
    }
    return signStream;
  },

  createVerify({ signature, algorithm, key, publicKey, secret }) {
    const verifyStream = new VerifyStream(signature, algorithm, publicKey || key || secret);
    if (signature) {
      verifyStream.write(signature);
      verifyStream.end();
    }
    return verifyStream;
  },

  _createSignature(encodedHeader, encodedPayload, key, alg) {
    const data = `${encodedHeader}.${encodedPayload}`;
    switch (alg.slice(0, 2)) {
      case 'HS':
        return crypto.createHmac(alg.replace('HS', 'sha'), key).update(data).digest('base64url');
      case 'RS':
      case 'ES':
      case 'PS':
        return crypto.sign(alg.replace('ES', 'ecdsa').replace('RS', 'RSA-SHA').replace('PS', 'RSA-SHA'), Buffer.from(data), key).toString('base64url');
      case 'no':
        return '';
      default:
        throw new Error('Unsupported algorithm');
    }
  }
};

class SignStream extends Writable {
  constructor(header, key) {
    super();
    this.header = header;
    this.key = key;
    this.chunks = [];
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }

  end() {
    const payload = Buffer.concat(this.chunks).toString();
    const signature = jws.sign({ header: this.header, payload, privateKey: this.key });
    this.emit('done', signature);
  }
}

class VerifyStream extends Writable {
  constructor(signature, algorithm, key) {
    super();
    this.signature = signature;
    this.algorithm = algorithm;
    this.key = key;
  }

  _write(chunk, encoding, callback) {
    this.signature = chunk.toString();
    callback();
  }

  end() {
    const valid = jws.verify(this.signature, this.algorithm, this.key);
    this.emit('done', valid, valid ? jws.decode(this.signature) : null);
  }
}

module.exports = jws;
