// Import the necessary crypto module
import crypto from 'crypto';

// Define a class called JOSE to handle JWT operations
class JOSE {
  constructor() {
    // Define a header specific to the JWT
    this.jwsHeader = {
      alg: 'HS256',
      typ: 'JWT'
    };
  }

  // Generate a pair of asymmetric keys (public and private)
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    return { publicKey, privateKey };
  }

  // Export a given key to PEM format
  exportKey(key) {
    return key.export({ type: 'pkcs1', format: 'pem' });
  }

  // Sign a given payload to create a JWT
  signJWT(payload, privateKey) {
    const header = Buffer.from(JSON.stringify(this.jwsHeader)).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const unsignedToken = `${header}.${body}`;
    
    const signature = crypto.sign("sha256", Buffer.from(unsignedToken), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }).toString('base64');

    return `${unsignedToken}.${signature}`;
  }

  // Verify a JWT with the provided public key
  verifyJWT(token, publicKey) {
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

// Example usage of the JOSE class
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

// Export the JOSE class for use in other modules
export default JOSE;
