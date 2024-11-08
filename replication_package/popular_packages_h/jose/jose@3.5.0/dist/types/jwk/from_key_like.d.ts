import type { JWK, KeyLike } from '../types.d';
/**
 * Converts a runtime-specific key representation (KeyLike) to a JWK.
 *
 * @param key Key representation to transform to a JWK.
 *
 * @example
 * ```
 * // ESM import
 * import fromKeyLike from 'jose/jwk/from_key_like'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: fromKeyLike } = require('jose/jwk/from_key_like')
 * ```
 *
 * @example
 * ```
 * // usage
 * const privateJwk = fromKeyLike(privateKey)
 * const publicJwk = fromKeyLike(publicKey)
 *
 * console.log(privateJwk)
 * console.log(publicJwk)
 * ```
 */
export default function fromKeyLike(key: KeyLike): Promise<JWK>;
export type { KeyLike, JWK };
