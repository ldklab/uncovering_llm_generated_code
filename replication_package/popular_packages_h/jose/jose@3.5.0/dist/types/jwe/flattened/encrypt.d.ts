import type { KeyLike, FlattenedJWE, JWEHeaderParameters, JWEKeyManagementHeaderParameters, EncryptOptions } from '../../types.d';
/**
 * The FlattenedEncrypt class is a utility for creating Flattened JWE
 * objects.
 *
 * @example
 * ```
 * // ESM import
 * import FlattenedEncrypt from 'jose/jwe/flattened/encrypt'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: FlattenedEncrypt } = require('jose/jwe/flattened/encrypt')
 * ```
 *
 * @example
 * ```
 * // usage
 * import parseJwk from 'jose/jwk/parse'
 *
 * const encoder = new TextEncoder()
 * const publicKey = await parseJwk({
 *   e: 'AQAB',
 *   n: 'qpzYkTGRKSUcd12hZaJnYEKVLfdEsqu6HBAxZgRSvzLFj_zTSAEXjbf3fX47MPEHRw8NDcEXPjVOz84t4FTXYF2w2_LGWfp_myjV8pR6oUUncJjS7DhnUmTG5bpuK2HFXRMRJYz_iNR48xRJPMoY84jrnhdIFx8Tqv6w4ZHVyEvcvloPgwG3UjLidP6jmqbTiJtidVLnpQJRuFNFQJiluQXBZ1nOLC7raQshu7L9y0IatVU7vf0BPnmuSkcNNvmQkSta6ODQBPaL5-o5SW8H37vQjPDkrlJpreViNa3jqP5DB5HYUO-DMh4FegRv9gZWLDEvXpSd9A13YXCa9Q8K_w',
 *   kty: 'RSA'
 * }, 'RSA-OAEP-256')
 *
 * const jwe = await new FlattenedEncrypt(encoder.encode('It’s a dangerous business, Frodo, going out your door.'))
 *   .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
 *   .setAdditionalAuthenticatedData(encoder.encode('The Fellowship of the Ring'))
 *   .encrypt(publicKey)
 *
 * console.log(jwe)
 * ```
 */
export default class FlattenedEncrypt {
    private _plaintext;
    private _protectedHeader;
    private _sharedUnprotectedHeader;
    private _unprotectedHeader;
    private _aad;
    private _cek;
    private _iv;
    private _keyManagementParameters;
    /**
     * @param plaintext Binary representation of the plaintext to encrypt.
     */
    constructor(plaintext: Uint8Array);
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
     * Sets the JWE Protected Header on the FlattenedEncrypt object.
     *
     * @param protectedHeader JWE Protected Header.
     */
    setProtectedHeader(protectedHeader: JWEHeaderParameters): this;
    /**
     * Sets the JWE Shared Unprotected Header on the FlattenedEncrypt object.
     *
     * @param sharedUnprotectedHeader JWE Shared Unprotected Header.
     */
    setSharedUnprotectedHeader(sharedUnprotectedHeader: JWEHeaderParameters): this;
    /**
     * Sets the JWE Per-Recipient Unprotected Header on the FlattenedEncrypt object.
     *
     * @param unprotectedHeader JWE Per-Recipient Unprotected Header.
     */
    setUnprotectedHeader(unprotectedHeader: JWEHeaderParameters): this;
    /**
     * Sets the Additional Authenticated Data on the FlattenedEncrypt object.
     *
     * @param aad Additional Authenticated Data.
     */
    setAdditionalAuthenticatedData(aad: Uint8Array): this;
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
     * Encrypts and resolves the value of the Flattened JWE object.
     *
     * @param key Public Key or Secret to encrypt the JWE with.
     * @param options JWE Encryption options.
     */
    encrypt(key: KeyLike, options?: EncryptOptions): Promise<FlattenedJWE>;
}
export type { KeyLike, FlattenedJWE, JWEHeaderParameters, JWEKeyManagementHeaderParameters };
