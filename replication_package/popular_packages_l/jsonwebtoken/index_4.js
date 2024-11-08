const crypto = require('crypto');
const jws = require('jws');

const algorithms = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
  RS256: 'RSA-SHA256',
  RS384: 'RSA-SHA384',
  RS512: 'RSA-SHA512',
  ES256: 'ecdsa-with-SHA256',
  ES384: 'ecdsa-with-SHA384',
  ES512: 'ecdsa-with-SHA512'
};

class JsonWebTokenError extends Error {
  constructor(message, error) {
    super(message);
    this.name = 'JsonWebTokenError';
    this.inner = error;
  }
}

class TokenExpiredError extends JsonWebTokenError {
  constructor(message, expiredAt) {
    super(message);
    this.name = 'TokenExpiredError';
    this.expiredAt = expiredAt;
  }
}

class NotBeforeError extends JsonWebTokenError {
  constructor(message, date) {
    super(message);
    this.name = 'NotBeforeError';
    this.date = date;
  }
}

function sign(payload, secretOrPrivateKey, options = {}, callback) {
  if (!secretOrPrivateKey) {
    throw new JsonWebTokenError('A secret or private key is required');
  }
  const header = { alg: options.algorithm || 'HS256', typ: 'JWT' };
  const tokenPayload = JSON.stringify(payload);

  if (callback) {
    process.nextTick(() => {
      try {
        const signature = jws.sign({ header, payload: tokenPayload, secret: secretOrPrivateKey, encoding: 'utf8' });
        callback(null, signature);
      } catch (err) {
        callback(err);
      }
    });
    return;
  }
  
  return jws.sign({ header, payload: tokenPayload, secret: secretOrPrivateKey, encoding: 'utf8' });
}

function verify(token, secretOrPublicKey, options = {}, callback) {
  if (!token || !secretOrPublicKey) {
    const error = new JsonWebTokenError('Token and secret/public key are required');
    if (callback) return callback(error);
    throw error;
  }

  const decoded = decode(token, { complete: true });
  if (!decoded) {
    const error = new JsonWebTokenError('Invalid token');
    if (callback) return callback(error);
    throw error;
  }

  const validSignature = crypto.createVerify(algorithms[decoded.header.alg])
    .update(decoded.input)
    .end()
    .verify(secretOrPublicKey, decoded.signature, 'base64');
  
  if (!validSignature) {
    const error = new JsonWebTokenError('Invalid signature');
    if (callback) return callback(error);
    throw error;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if ('exp' in decoded.payload && currentTime >= decoded.payload.exp) {
    const error = new TokenExpiredError('JWT expired', new Date(decoded.payload.exp * 1000));
    if (callback) return callback(error);
    throw error;
  }

  if ('nbf' in decoded.payload && currentTime < decoded.payload.nbf) {
    const error = new NotBeforeError('JWT not active', new Date(decoded.payload.nbf * 1000));
    if (callback) return callback(error);
    throw error;
  }

  if (callback) return callback(null, decoded.payload);
  return decoded.payload;
}

function decode(token, options = {}) {
  try {
    const decoded = jws.decode(token);
    if (!decoded) throw new Error('Invalid token');

    const payload = JSON.parse(Buffer.from(decoded.payload, 'base64').toString('utf8'));
    if (options.complete) {
      return { header: decoded.header, payload, signature: decoded.signature };
    }
    return payload;
  } catch (err) {
    throw new JsonWebTokenError('Invalid token', err);
  }
}

module.exports = {
  sign,
  verify,
  decode,
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
};
