const crypto = require('crypto');
const { Writable } = require('stream');

const jws = {
  ALGORITHMS: [
    'HS256', 'HS384', 'HS512',
    'RS256', 'RS384', 'RS512',
    'PS256', 'PS384', 'PS512',
    'ES256', 'ES384', 'ES512',
    'none'
  ],

  sign({ header, payload, secret, privateKey, encoding = 'utf8' }) {
    this.#validateAlgorithm(header);
    const encodedHeader = this.#base64urlEncode(JSON.stringify(header));
    const encodedPayload = this.#base64urlEncode(typeof payload === 'string' ? payload : JSON.stringify(payload));
    const signature = this.#createSignature(encodedHeader, encodedPayload, secret || privateKey, header.alg);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  verify(signature, algorithm, secretOrKey) {
    const [encodedHeader, encodedPayload, signaturePart] = signature.split('.');
    if (!encodedHeader || !encodedPayload || !signaturePart) return false;

    const header = this.#base64urlDecode(encodedHeader);
    if (header.alg !== algorithm) return false;

    const expectedSignature = this.#createSignature(encodedHeader, encodedPayload, secretOrKey, algorithm);
    return expectedSignature === signaturePart;
  },

  decode(signature) {
    const [encodedHeader, encodedPayload, signaturePart] = signature.split('.');
    return {
      header: this.#base64urlDecode(encodedHeader),
      payload: this.#base64urlDecode(encodedPayload),
      signature: signaturePart
    };
  },

  createSign({ header, payload, privateKey, secret }) {
    return new SignStream(header, privateKey || secret, payload);
  },

  createVerify({ signature, algorithm, key, publicKey, secret }) {
    return new VerifyStream(signature, algorithm, publicKey || key || secret);
  },

  #validateAlgorithm(header) {
    if (!header || !header.alg || !this.ALGORITHMS.includes(header.alg)) {
      throw new Error('Invalid algorithm');
    }
  },

  #base64urlEncode(data) {
    return Buffer.from(data).toString('base64url');
  },

  #base64urlDecode(data) {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  },

  #createSignature(encodedHeader, encodedPayload, key, alg) {
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
  constructor(header, key, initialPayload) {
    super();
    this.header = header;
    this.key = key;
    this.chunks = initialPayload ? [initialPayload] : [];
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
