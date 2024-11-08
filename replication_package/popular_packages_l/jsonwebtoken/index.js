// jsonwebtoken.js

const crypto = require('crypto');
const fs = require('fs');
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
  const header = { alg: options.algorithm || 'HS256', typ: 'JWT' };

  if (!secretOrPrivateKey) {
    throw new JsonWebTokenError('secretOrPrivateKey must have a value');
  }

  // Synchronous signing if no callback is provided
  if (!callback) {
    const signature = jws.sign({
      header,
      payload: JSON.stringify(payload),
      secret: secretOrPrivateKey,
      encoding: 'utf8',
    });
    return signature;
  }

  // Asynchronous signing if callback is present
  process.nextTick(() => {
    try {
      const signature = jws.sign({
        header,
        payload: JSON.stringify(payload),
        secret: secretOrPrivateKey,
        encoding: 'utf8',
      });
      callback(null, signature);
    } catch (err) {
      callback(err);
    }
  });
}

function verify(token, secretOrPublicKey, options = {}, callback) {
  if (!token) {
    return callback ? callback(new JsonWebTokenError('jwt must be provided')) : undefined;
  }

  if (!secretOrPublicKey) {
    return callback ? callback(new JsonWebTokenError('Secret or public key must be provided.')) : undefined;
  }

  const decoded = decode(token, { complete: true });

  if (!decoded) {
    return callback ? callback(new JsonWebTokenError('invalid token')) : undefined;
  }

  const header = decoded.header;
  const payload = decoded.payload;
  const signature = crypto.createVerify(algorithms[header.alg])
    .update(decoded.input)
    .end()
    .verify(secretOrPublicKey, decoded.signature, 'base64');

  if (!signature) {
    return callback ? callback(new JsonWebTokenError('invalid signature')) : undefined;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  if (payload.exp && currentTime >= payload.exp) {
    return callback ? callback(new TokenExpiredError('jwt expired', new Date(payload.exp * 1000))) : undefined;
  }

  if (payload.nbf && currentTime < payload.nbf) {
    return callback ? callback(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000))) : undefined;
  }

  callback ? callback(null, payload) : payload;
}

function decode(token, options = {}) {
  try {
    const decoded = jws.decode(token);
    if (!decoded) {
      throw new JsonWebTokenError('invalid token');
    }

    const payload = JSON.parse(Buffer.from(decoded.payload, 'base64').toString('utf8'));

    if (options.complete) {
      return { header: decoded.header, payload, signature: decoded.signature };
    }

    return payload;
  } catch (err) {
    throw new JsonWebTokenError('invalid token', err);
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
