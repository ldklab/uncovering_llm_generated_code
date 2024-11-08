import type { KeyLike, FlattenedJWS, JWSHeaderParameters, SignOptions } from '../../types.d';
/**
 * The FlattenedSign class is a utility for creating Flattened JWS objects.
 *
 * @example
 * ```
 * // ESM import
 * import FlattenedSign from 'jose/jws/flattened/sign'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: FlattenedSign } = require('jose/jws/flattened/sign')
 * ```
 *
 * @example
 * ```
 * // usage
 * import parseJwk from 'jose/jwk/parse'
 *
 * const encoder = new TextEncoder()
 * const privateKey = await parseJwk({
 *   alg: 'ES256',
 *   crv: 'P-256',
 *   kty: 'EC',
 *   d: 'VhsfgSRKcvHCGpLyygMbO_YpXc7bVKwi12KQTE4yOR4',
 *   x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
 *   y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
 * })
 *
 * const jws = await new FlattenedSign(encoder.encode('It’s a dangerous business, Frodo, going out your door.'))
 *   .setProtectedHeader({ alg: 'ES256' })
 *   .sign(privateKey)
 * console.log(jws)
 * ```
 */
export default class FlattenedSign {
    private _payload;
    private _protectedHeader;
    private _unprotectedHeader;
    /**
     * @param payload Binary representation of the payload to sign.
     */
    constructor(payload: Uint8Array);
    /**
     * Sets the JWS Protected Header on the FlattenedSign object.
     *
     * @param protectedHeader JWS Protected Header.
     */
    setProtectedHeader(protectedHeader: JWSHeaderParameters): this;
    /**
     * Sets the JWS Unprotected Header on the FlattenedSign object.
     *
     * @param unprotectedHeader JWS Unprotected Header.
     */
    setUnprotectedHeader(unprotectedHeader: JWSHeaderParameters): this;
    /**
     * Signs and resolves the value of the Flattened JWS object.
     *
     * @param key Private Key or Secret to sign the JWS with.
     * @param options JWS Sign options.
     */
    sign(key: KeyLike, options?: SignOptions): Promise<FlattenedJWS>;
}
export type { KeyLike, FlattenedJWS, JWSHeaderParameters };
