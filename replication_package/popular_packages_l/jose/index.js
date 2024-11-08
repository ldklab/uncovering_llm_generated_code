markdown
# index.js

import crypto from 'crypto';

class JOSE {
  constructor() {
    this.jwsHeader = {
      alg: 'HS256',
      typ: 'JWT'
    };
  }

  generateKeyPair() {
    // Asymmetric Key Pair Generation (using RSA)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    return { publicKey, privateKey };
  }

  exportKey(key) {
    // Export Public/Private key to PEM format
    return key.export({ type: 'pkcs1', format: 'pem' });
  }

  signJWT(payload, privateKey) {
    // Create JWT, sign it and return
    const header = Buffer.from(JSON.stringify(this.jwsHeader)).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const unsignedToken = `${header}.${body}`;
    
    const signature = crypto.sign("sha256", Buffer.from(unsignedToken), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }).toString('base64');

    return `${unsignedToken}.${signature}`;
  }

  verifyJWT(token, publicKey) {
    // Verify the given JWT and return payload if valid
    const [header, payload, signature] = token.split('.');
    const isValid = crypto.verify(
      "sha256",
      Buffer.from(`${header}.${payload}`),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(signature, 'base64')
    );

    if (!isValid) throw new Error('Invalid token');

    return JSON.parse(Buffer.from(payload, 'base64').toString());
  }
}

// Example usage:
const jose = new JOSE();
const { publicKey, privateKey } = jose.generateKeyPair();
const exportedPublicKey = jose.exportKey(publicKey);
const exportedPrivateKey = jose.exportKey(privateKey);

const payload = { sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000) };

const jwt = jose.signJWT(payload, exportedPrivateKey);
console.log('Signed JWT:', jwt);

try {
  const verifiedPayload = jose.verifyJWT(jwt, exportedPublicKey);
  console.log('Verified Payload:', verifiedPayload);
} catch (err) {
  console.error('Verification failed:', err.message);
}

export default JOSE;
