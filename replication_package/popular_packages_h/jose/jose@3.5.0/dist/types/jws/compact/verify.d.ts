import type { CompactVerifyResult, FlattenedJWSInput, GetKeyFunction, JWSHeaderParameters, KeyLike, VerifyOptions } from '../../types.d';
/**
 * Interface for Compact JWS Verification dynamic key resolution.
 * No token components have been verified at the time of this function call.
 */
export interface CompactVerifyGetKey extends GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> {
}
/**
 * Verifies the signature and format of and afterwards decodes the Compact JWS.
 *
 * @param jws Compact JWS.
 * @param key Key, or a function resolving a key, to verify the JWS with.
 * @param options JWS Verify options.
 *
 * @example
 * ```
 * // ESM import
 * import compactVerify from 'jose/jws/compact/verify'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: compactVerify } = require('jose/jws/compact/verify')
 * ```
 *
 * @example
 * ```
 * // usage
 * import parseJwk from 'jose/jwk/parse'
 *
 * const decoder = new TextDecoder()
 * const jws = 'eyJhbGciOiJFUzI1NiJ9.SXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4.kkAs_gPPxWMI3rHuVlxHaTPfDWDoqdI8jSvuSmqV-8IHIWXg9mcAeC9ggV-45ZHRbiRJ3obUIFo1rHphPA5URg'
 * const publicKey = await parseJwk({
 *   alg: 'ES256',
 *   crv: 'P-256',
 *   kty: 'EC',
 *   x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
 *   y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
 * })
 *
 * const { payload, protectedHeader } = await compactVerify(jws, publicKey)
 *
 * console.log(protectedHeader)
 * console.log(decoder.decode(payload))
 * ```
 */
export default function compactVerify(jws: string | Uint8Array, key: KeyLike | CompactVerifyGetKey, options?: VerifyOptions): Promise<CompactVerifyResult>;
export type { KeyLike, VerifyOptions };
