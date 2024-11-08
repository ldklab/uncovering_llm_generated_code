import type { FlattenedVerifyResult, KeyLike, FlattenedJWSInput, JWSHeaderParameters, VerifyOptions, GetKeyFunction } from '../../types.d';
/**
 * Interface for Flattened JWS Verification dynamic key resolution.
 * No token components have been verified at the time of this function call.
 */
export interface FlattenedVerifyGetKey extends GetKeyFunction<JWSHeaderParameters | undefined, FlattenedJWSInput> {
}
/**
 * Verifies the signature and format of and afterwards decodes the Flattened JWS.
 *
 * @param jws Flattened JWS.
 * @param key Key, or a function resolving a key, to verify the JWS with.
 * @param options JWS Verify options.
 *
 * @example
 * ```
 * // ESM import
 * import flattenedVerify from 'jose/jws/flattened/verify'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: flattenedVerify } = require('jose/jws/flattened/verify')
 * ```
 *
 * @example
 * ```
 * // usage
 * import parseJwk from 'jose/jwk/parse'
 *
 * const decoder = new TextDecoder()
 * const jws = {
 *   signature: 'FVVOXwj6kD3DqdfD9yYqfT2W9jv-Nop4kOehp_DeDGNB5dQNSPRvntBY6xH3uxlCxE8na9d_kyhYOcanpDJ0EA',
 *   payload: 'SXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4',
 *   protected: 'eyJhbGciOiJFUzI1NiJ9'
 * }
 * const publicKey = await parseJwk({
 *   alg: 'ES256',
 *   crv: 'P-256',
 *   kty: 'EC',
 *   x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
 *   y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
 * })
 *
 * const { payload, protectedHeader } = await flattenedVerify(jws, publicKey)
 *
 * console.log(protectedHeader)
 * console.log(decoder.decode(payload))
 * ```
 */
export default function flattenedVerify(jws: FlattenedJWSInput, key: KeyLike | FlattenedVerifyGetKey, options?: VerifyOptions): Promise<FlattenedVerifyResult>;
export type { KeyLike, FlattenedJWSInput, GetKeyFunction, JWSHeaderParameters, VerifyOptions };
