import type { JWSHeaderParameters, JWTClaimVerificationOptions, JWTPayload } from '../types.d';
import ProduceJWT from '../lib/jwt_producer.js';
/**
 * The UnsecuredJWT class is a utility for creating `{ "alg": "none" }` Unsecured JWTs.
 *
 * @example
 * ```
 * // ESM import
 * import UnsecuredJWT from 'jose/jwt/unsecured'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: UnsecuredJWT } = require('jose/jwt/unsecured')
 * ```
 *
 * @example
 * ```
 * // encoding
 *
 * const unsecuredJwt = new UnsecuredJWT({ 'urn:example:claim': true })
 *   .setIssuedAt()
 *   .setIssuer('urn:example:issuer')
 *   .setAudience('urn:example:audience')
 *   .setExpirationTime('2h')
 *   .encode()
 *
 * console.log(unsecuredJwt)
 * ```
 *
 * @example
 * ```
 * // decoding
 *
 * const payload = new UnsecuredJWT.decode(jwt, {
 *   issuer: 'urn:example:issuer',
 *   audience: 'urn:example:audience'
 * })
 *
 * console.log(payload)
 * ```
 */
export default class UnsecuredJWT extends ProduceJWT {
    /**
     * Encodes the Unsecured JWT.
     */
    encode(): string;
    /**
     * Decodes an unsecured JWT.
     *
     * @param jwt Unsecured JWT to decode the payload of.
     * @param options JWT Claims Set validation options.
     *
     * @example
     * ```
     * // decoding
     * const { payload, header } = UnsecuredJWT.decode(unsecuredJwt)
     *
     * console.log(header)
     * console.log(payload)
     * ```
     */
    static decode(jwt: string, options?: JWTClaimVerificationOptions): {
        payload: JWTPayload;
        header: JWSHeaderParameters;
    };
}
export type { JWSHeaderParameters, JWTPayload };
