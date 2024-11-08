import type { EncryptOptions, JWEHeaderParameters, JWEKeyManagementHeaderParameters, JWTPayload, KeyLike } from '../types.d';
import ProduceJWT from '../lib/jwt_producer.js';
/**
 * The EncryptJWT class is a utility for creating Compact JWE formatted JWT strings.
 *
 * @example
 * ```
 * // ESM import
 * import EncryptJWT from 'jose/jwt/encrypt'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: EncryptJWT } = require('jose/jwt/encrypt')
 * ```
 *
 * @example
 * ```
 * // usage
 * const secretKey = Uint8Array.from([
 *   206, 203, 53, 165, 235, 214, 153, 188,
 *   248, 225,  1, 132, 105, 204,  75,  42,
 *   186, 185, 24, 223, 136,  66, 116,  59,
 *   183, 155, 52,  52, 101, 167, 201,  85
 * ])
 * const jwt = await new EncryptJWT({ 'urn:example:claim': true })
 *   .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
 *   .setIssuedAt()
 *   .setIssuer('urn:example:issuer')
 *   .setAudience('urn:example:audience')
 *   .setExpirationTime('2h')
 *   .encrypt(secretKey)
 *
 * console.log(jwt)
 * ```
 */
export default class EncryptJWT extends ProduceJWT {
    private _cek;
    private _iv;
    private _keyManagementParameters;
    private _protectedHeader;
    private _replicateIssuerAsHeader;
    private _replicateSubjectAsHeader;
    private _replicateAudienceAsHeader;
    /**
     * Sets the JWE Protected Header on the EncryptJWT object.
     *
     * @param protectedHeader JWE Protected Header.
     * Must contain an "alg" (JWE Algorithm) and "enc" (JWE
     * Encryption Algorithm) properties.
     */
    setProtectedHeader(protectedHeader: JWEHeaderParameters): this;
    /**
     * Sets the JWE Key Management parameters to be used when encrypting.
     * Use of this is method is really only needed for ECDH-ES based algorithms
     * when utilizing the Agreement PartyUInfo or Agreement PartyVInfo parameters.
     * Other parameters will always be randomly generated when needed and missing.
     *
     * @param parameters JWE Key Management parameters.
     */
    setKeyManagementParameters(parameters: JWEKeyManagementHeaderParameters): this;
    /**
     * Sets a content encryption key to use, by default a random suitable one
     * is generated for the JWE enc" (Encryption Algorithm) Header Parameter.
     * You do not need to invoke this method, it is only really intended for
     * test and vector validation purposes.
     *
     * @param cek JWE Content Encryption Key.
     */
    setContentEncryptionKey(cek: Uint8Array): this;
    /**
     * Sets the JWE Initialization Vector to use for content encryption, by default
     * a random suitable one is generated for the JWE enc" (Encryption Algorithm)
     * Header Parameter. You do not need to invoke this method, it is only really
     * intended for test and vector validation purposes.
     *
     * @param iv JWE Initialization Vector.
     */
    setInitializationVector(iv: Uint8Array): this;
    /**
     * Replicates the "iss" (Issuer) Claim as a JWE Protected Header Parameter as per
     * [RFC7519#section-5.3](https://tools.ietf.org/html/rfc7519#section-5.3).
     */
    replicateIssuerAsHeader(): this;
    /**
     * Replicates the "sub" (Subject) Claim as a JWE Protected Header Parameter as per
     * [RFC7519#section-5.3](https://tools.ietf.org/html/rfc7519#section-5.3).
     */
    replicateSubjectAsHeader(): this;
    /**
     * Replicates the "aud" (Audience) Claim as a JWE Protected Header Parameter as per
     * [RFC7519#section-5.3](https://tools.ietf.org/html/rfc7519#section-5.3).
     */
    replicateAudienceAsHeader(): this;
    /**
     * Encrypts and returns the JWT.
     *
     * @param key Public Key or Secret to encrypt the JWT with.
     * @param options JWE Encryption options.
     */
    encrypt(key: KeyLike, options?: EncryptOptions): Promise<string>;
}
export type { JWEHeaderParameters, JWTPayload, KeyLike };
