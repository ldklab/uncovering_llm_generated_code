import type { GeneralJWSInput, GeneralVerifyResult, FlattenedJWSInput, GetKeyFunction, JWSHeaderParameters, KeyLike, VerifyOptions } from '../../types.d';
/**
 * Interface for General JWS Verification dynamic key resolution.
 * No token components have been verified at the time of this function call.
 */
export interface GeneralVerifyGetKey extends GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> {
}
/**
 * Verifies the signature and format of and afterwards decodes the General JWS.
 *
 * @param jws General JWS.
 * @param key Key, or a function resolving a key, to verify the JWS with.
 * @param options JWS Verify options.
 *
 * @example
 * ```
 * // ESM import
 * import generalVerify from 'jose/jws/general/verify'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: generalVerify } = require('jose/jws/general/verify')
 * ```
 *
 * @example
 * ```
 * // usage
 * import parseJwk from 'jose/jwk/parse'
 *
 * const decoder = new TextDecoder()
 * const jws = {
 *   payload: 'SXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4',
 *   signatures: [
 *     {
 *       signature: 'FVVOXwj6kD3DqdfD9yYqfT2W9jv-Nop4kOehp_DeDGNB5dQNSPRvntBY6xH3uxlCxE8na9d_kyhYOcanpDJ0EA',
 *       protected: 'eyJhbGciOiJFUzI1NiJ9'
 *     }
 *   ]
 * }
 * const publicKey = await parseJwk({
 *   alg: 'ES256',
 *   crv: 'P-256',
 *   kty: 'EC',
 *   x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
 *   y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
 * })
 *
 * const { payload, protectedHeader } = await generalVerify(jws, publicKey)
 *
 * console.log(protectedHeader)
 * console.log(decoder.decode(payload))
 * ```
 */
export default function generalVerify(jws: GeneralJWSInput, key: KeyLike | GeneralVerifyGetKey, options?: VerifyOptions): Promise<GeneralVerifyResult>;
export type { KeyLike, GeneralJWSInput, VerifyOptions };
