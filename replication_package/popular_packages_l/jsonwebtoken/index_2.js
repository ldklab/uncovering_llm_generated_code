const crypto = require('crypto');
const jws = require('jws');

const algorithmsMap = {
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
  
  if (!secretOrPrivateKey) throw new JsonWebTokenError('Missing secret or private key');

  const signature = () => jws.sign({
    header,
    payload: JSON.stringify(payload),
    secret: secretOrPrivateKey,
    encoding: 'utf8'
  });

  if (callback) {
    process.nextTick(() => {
      try {
        callback(null, signature());
      } catch (err) {
        callback(err);
      }
    });
  } else {
    return signature();
  }
}

function verify(token, secretOrPublicKey, options = {}, callback) {
  if (!token) {
    const error = new JsonWebTokenError('Token not provided');
    return callback ? callback(error) : undefined;
  }
  
  if (!secretOrPublicKey) {
    const error = new JsonWebTokenError('Secret or public key not provided');
    return callback ? callback(error) : undefined;
  }
  
  const decoded = decode(token, { complete: true });
  if (!decoded) {
    const error = new JsonWebTokenError('Invalid token');
    return callback ? callback(error) : undefined;
  }

  const { header, payload } = decoded;
  const algorithm = algorithmsMap[header.alg];

  const isValidSignature = crypto.createVerify(algorithm)
    .update(decoded.input)
    .verify(secretOrPublicKey, decoded.signature, 'base64');

  if (!isValidSignature) {
    const error = new JsonWebTokenError('Invalid signature');
    return callback ? callback(error) : undefined;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  if (payload.exp && currentTime >= payload.exp) {
    const error = new TokenExpiredError('Token expired', new Date(payload.exp * 1000));
    return callback ? callback(error) : undefined;
  }

  if (payload.nbf && currentTime < payload.nbf) {
    const error = new NotBeforeError('Token not active', new Date(payload.nbf * 1000));
    return callback ? callback(error) : undefined;
  }

  return callback ? callback(null, payload) : payload;
}

function decode(token, options = {}) {
  try {
    const decoded = jws.decode(token);

    if (!decoded) throw new JsonWebTokenError('Invalid token');

    const payload = JSON.parse(Buffer.from(decoded.payload, 'base64').toString('utf8'));

    return options.complete ? { header: decoded.header, payload, signature: decoded.signature } : payload;
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
  NotBeforeError
};
