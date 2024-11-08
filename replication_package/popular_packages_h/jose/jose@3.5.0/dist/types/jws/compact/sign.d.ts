import type { JWSHeaderParameters, KeyLike, SignOptions } from '../../types.d';
/**
 * The CompactSign class is a utility for creating Compact JWS strings.
 *
 * @example
 * ```
 * // ESM import
 * import CompactSign from 'jose/jws/compact/sign'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: CompactSign } = require('jose/jws/compact/sign')
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
 * const jws = await new CompactSign(encoder.encode('It’s a dangerous business, Frodo, going out your door.'))
 *   .setProtectedHeader({ alg: 'ES256' })
 *   .sign(privateKey)
 *
 * console.log(jws)
 * ```
 */
export default class CompactSign {
    private _flattened;
    /**
     * @param payload Binary representation of the payload to sign.
     */
    constructor(payload: Uint8Array);
    /**
     * Sets the JWS Protected Header on the Sign object.
     *
     * @param protectedHeader JWS Protected Header.
     */
    setProtectedHeader(protectedHeader: JWSHeaderParameters): this;
    /**
     * Signs and resolves the value of the Compact JWS string.
     *
     * @param key Private Key or Secret to sign the JWS with.
     * @param options JWS Sign options.
     */
    sign(key: KeyLike, options?: SignOptions): Promise<string>;
}
export type { JWSHeaderParameters, KeyLike };
