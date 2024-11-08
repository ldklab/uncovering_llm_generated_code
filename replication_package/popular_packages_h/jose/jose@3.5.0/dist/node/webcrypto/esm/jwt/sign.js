import CompactSign from '../jws/compact/sign.js';
import { JWTInvalid } from '../util/errors.js';
import { encoder } from '../lib/buffer_utils.js';
import ProduceJWT from '../lib/jwt_producer.js';
export default class SignJWT extends ProduceJWT {
    setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
    }
    async sign(key, options) {
        const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (this._protectedHeader.crit?.includes('b64') && this._protectedHeader.b64 === false) {
            throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
        }
        return sig.sign(key, options);
    }
}
