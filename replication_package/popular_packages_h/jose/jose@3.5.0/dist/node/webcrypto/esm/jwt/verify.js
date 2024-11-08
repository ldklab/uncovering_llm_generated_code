import verify from '../jws/compact/verify.js';
import jwtPayload from '../lib/jwt_claims_set.js';
import { JWTInvalid } from '../util/errors.js';
export default async function jwtVerify(jwt, key, options) {
    const verified = await verify(jwt, key, options);
    if (verified.protectedHeader.crit?.includes('b64') && verified.protectedHeader.b64 === false) {
        throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
    }
    const payload = jwtPayload(verified.protectedHeader, verified.payload, options);
    return { payload, protectedHeader: verified.protectedHeader };
}
