import type { KeyLike, DecryptOptions, JWTPayload, JWTClaimVerificationOptions, GetKeyFunction, JWEHeaderParameters, FlattenedJWE, JWTDecryptResult } from '../types.d';
/**
 * Combination of JWE Decryption options and JWT Claims Set verification options.
 */
interface JWTDecryptOptions extends DecryptOptions, JWTClaimVerificationOptions {
}
/**
 * Interface for JWT Decryption dynamic key resolution.
 * No token components have been verified at the time of this function call.
 */
export interface JWTDecryptGetKey extends GetKeyFunction<JWEHeaderParameters, FlattenedJWE> {
}
/**
 * Verifies the JWT format (to be a JWE Compact format), decrypts the ciphertext, validates the JWT Claims Set.
 *
 * @param jwt JSON Web Token value (encoded as JWE).
 * @param key Private Key or Secret, or a function resolving one, to decrypt and verify the JWT with.
 * @param options JWT Decryption and JWT Claims Set validation options.
 *
 * @example
 * ```
 * // ESM import
 * import jwtDecrypt from 'jose/jwt/decrypt'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: jwtDecrypt } = require('jose/jwt/decrypt')
 * ```
 *
 * @example
 * ```
 * // usage
 * const jwt = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..KVcNLqK-3-8ZkYIC.xSwF4VxO0kUMUD2W-cifsNUxnr-swyBq-nADBptyt6y9n79-iNc5b0AALJpRwc0wwDkJw8hNOMjApNUTMsK9b-asToZ3DXFMvwfJ6n1aWefvd7RsoZ2LInWFfVAuttJDzoGB.uuexQoWHwrLMEYRElT8pBQ'
 * const secretKey = Uint8Array.from([
 *   206, 203, 53, 165, 235, 214, 153, 188,
 *   248, 225,  1, 132, 105, 204,  75,  42,
 *   186, 185, 24, 223, 136,  66, 116,  59,
 *   183, 155, 52,  52, 101, 167, 201,  85
 * ])
 *
 * const { payload, protectedHeader } = await jwtDecrypt(jwt, secretKey, {
 *   issuer: 'urn:example:issuer',
 *   audience: 'urn:example:audience'
 * })
 *
 * console.log(protectedHeader)
 * console.log(payload)
 * ```
 */
export default function jwtDecrypt(jwt: string | Uint8Array, key: KeyLike | JWTDecryptGetKey, options?: JWTDecryptOptions): Promise<JWTDecryptResult>;
export type { KeyLike, DecryptOptions, JWTPayload, JWTDecryptOptions };
