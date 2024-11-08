import type { JWSHeaderParameters, JWEHeaderParameters } from '../types.d';
export declare type ProtectedHeaderParameters = JWSHeaderParameters & JWEHeaderParameters;
/**
 * Decodes the Protected Header of a JWE/JWS/JWT token utilizing any encoding.
 *
 * @example
 * ```
 * // ESM import
 * import decodeProtectedHeader from 'jose/util/decode_protected_header'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: decodeProtectedHeader } = require('jose/util/decode_protected_header')
 * ```
 *
 * @example
 * ```
 * // usage
 * const protectedHeader = decodeProtectedHeader(token)
 * console.log(protectedHeader)
 * ```
 *
 * @param token JWE/JWS/JWT token in any encoding.
 */
export default function decodeProtectedHeader(token: string | object): ProtectedHeaderParameters;
