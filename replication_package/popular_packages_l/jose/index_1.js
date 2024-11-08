// index.js

import crypto from 'crypto';

class JOSE {
  constructor() {
    this.jwsHeader = {
      alg: 'HS256',
      typ: 'JWT'
    };
  }

  generateKeyPair() {
    // Generate an RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    return { publicKey, privateKey };
  }

  exportKeyAsPEM(key) {
    // Export a key to PEM format for easy sharing or storage
    return key.export({ type: 'pkcs1', format: 'pem' });
  }

  signJWT(payload, privateKey) {
    // Construct and sign a JWT, returning the serialized token
    const headerString = JSON.stringify(this.jwsHeader);
    const payloadString = JSON.stringify(payload);
    const headerBase64 = Buffer.from(headerString).toString('base64url');
    const payloadBase64 = Buffer.from(payloadString).toString('base64url');
    const signatureBaseString = `${headerBase64}.${payloadBase64}`;
    
    const signature = crypto.sign("sha256", Buffer.from(signatureBaseString), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }).toString('base64url');

    return `${signatureBaseString}.${signature}`;
  }

  verifyJWT(token, publicKey) {
    // Verify a JWT and return the payload if it's valid
    const [headerBase64, payloadBase64, signatureBase64] = token.split('.');
    const dataToVerify = `${headerBase64}.${payloadBase64}`;
    
    const isSignatureValid = crypto.verify(
      "sha256",
      Buffer.from(dataToVerify),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(signatureBase64, 'base64url')
    );

    if (!isSignatureValid) throw new Error('Invalid token');

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString();
    return JSON.parse(payloadJson);
  }
}

// Demonstration of usage
const jose = new JOSE();

// Key generation and export
const { publicKey, privateKey } = jose.generateKeyPair();
const publicKeyPEM = jose.exportKeyAsPEM(publicKey);
const privateKeyPEM = jose.exportKeyAsPEM(privateKey);

// Payload for JWT
const payload = {
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000)
};

// Sign the payload to create a JWT
const jwt = jose.signJWT(payload, privateKeyPEM);
console.log('Signed JWT:', jwt);

try {
  // Verify the signed JWT
  const verifiedPayload = jose.verifyJWT(jwt, publicKeyPEM);
  console.log('Verified Payload:', verifiedPayload);
} catch (error) {
  console.error('JWT verification failed:', error.message);
}

export default JOSE;
