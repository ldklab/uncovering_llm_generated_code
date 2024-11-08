import type { JWK } from '../types.d';
/**
 * Calculates a base64url-encoded JSON Web Key (JWK) Thumbprint as per
 * [RFC7638](https://tools.ietf.org/html/rfc7638).
 *
 * @param jwk JSON Web Key.
 * @param digestAlgorithm Digest Algorithm to use for calculating the thumbprint.
 * Default is sha256. Accepted is "sha256", "sha384", "sha512".
 *
 * @example
 * ```
 * // ESM import
 * import calculateThumbprint from 'jose/jwk/thumbprint'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: calculateThumbprint } = require('jose/jwk/thumbprint')
 * ```
 *
 * @example
 * ```
 * // usage
 * const thumbprint = await calculateThumbprint({
 *   kty: 'RSA',
 *   e: 'AQAB',
 *   n: '12oBZRhCiZFJLcPg59LkZZ9mdhSMTKAQZYq32k_ti5SBB6jerkh-WzOMAO664r_qyLkqHUSp3u5SbXtseZEpN3XPWGKSxjsy-1JyEFTdLSYe6f9gfrmxkUF_7DTpq0gn6rntP05g2-wFW50YO7mosfdslfrTJYWHFhJALabAeYirYD7-9kqq9ebfFMF4sRRELbv9oi36As6Q9B3Qb5_C1rAzqfao_PCsf9EPsTZsVVVkA5qoIAr47lo1ipfiBPxUCCNSdvkmDTYgvvRm6ZoMjFbvOtgyts55fXKdMWv7I9HMD5HwE9uW839PWA514qhbcIsXEYSFMPMV6fnlsiZvQQ'
 * })
 *
 * console.log(thumbprint)
 * ```
 */
export default function calculateThumbprint(jwk: JWK, digestAlgorithm?: 'sha256' | 'sha384' | 'sha512'): Promise<string>;
export type { JWK };
