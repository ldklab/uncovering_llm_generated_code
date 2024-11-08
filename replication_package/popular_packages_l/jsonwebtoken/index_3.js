// jsonwebtoken.js

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
  ES512: 'ecdsa-with-SHA512',
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
  if (!secretOrPrivateKey) throw new JsonWebTokenError('secretOrPrivateKey must have a value');

  const header = { alg: options.algorithm || 'HS256', typ: 'JWT' };
  const message = { header, payload: JSON.stringify(payload), secret: secretOrPrivateKey, encoding: 'utf8' };

  if (callback) {
    process.nextTick(() => {
      try {
        const signature = jws.sign(message);
        callback(null, signature);
      } catch (err) {
        callback(err);
      }
    });
  } else {
    return jws.sign(message);
  }
}

function verify(token, secretOrPublicKey, options = {}, callback) {
  if (!token || !secretOrPublicKey) {
    const error = !token ? 'jwt must be provided' : 'Secret or public key must be provided.';
    if (callback) return callback(new JsonWebTokenError(error));
  }

  const decoded = decode(token, { complete: true });
  if (!decoded) return callback && callback(new JsonWebTokenError('invalid token'));

  const { header, payload, signature } = decoded;
  const valid = crypto.createVerify(algorithms[header.alg])
    .update(decoded.input)
    .end()
    .verify(secretOrPublicKey, signature, 'base64');

  if (!valid) return callback && callback(new JsonWebTokenError('invalid signature'));

  const currentTime = Math.floor(Date.now() / 1000);
  if (payload.exp && currentTime >= payload.exp) {
    return callback && callback(new TokenExpiredError('jwt expired', new Date(payload.exp * 1000)));
  }

  if (payload.nbf && currentTime < payload.nbf) {
    return callback && callback(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000)));
  }

  callback && callback(null, payload);
  return payload;
}

function decode(token, options = {}) {
  try {
    const decoded = jws.decode(token);
    if (!decoded) throw new JsonWebTokenError('invalid token');

    const payload = JSON.parse(Buffer.from(decoded.payload, 'base64').toString('utf8'));
    if (options.complete) return { header: decoded.header, payload, signature: decoded.signature };

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
