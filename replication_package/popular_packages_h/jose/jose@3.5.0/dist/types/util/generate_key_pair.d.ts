/// <reference types="node" />
import type { KeyObject } from 'crypto';
export interface GenerateKeyPairOptions {
    /**
     * The EC "crv" (Curve) or OKP "crv" (Subtype of Key Pair) value to generate.
     * The curve must be both supported on the runtime as well as applicable for
     * the given JWA algorithm identifier.
     */
    crv?: string;
    /**
     * A hint for RSA algorithms to generate an RSA key of a given `modulusLength`
     * (Key size in bits). JOSE requires 2048 bits or larger. Default is 2048.
     */
    modulusLength?: number;
}
/**
 * Generates a private and a public key for a given JWA algorithm identifier.
 * This can only generate asymmetric key pairs. For symmetric secrets use the
 * `generateSecret` function.
 *
 * @example
 * ```
 * // ESM import
 * import generateKeyPair from 'jose/util/generate_key_pair'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: generateKeyPair } = require('jose/util/generate_key_pair')
 * ```
 *
 * @example
 * ```
 * // usage
 * const { publicKey, privateKey } = await generateKeyPair('PS256')
 * console.log(publicKey)
 * console.log(privateKey)
 * ```
 *
 * @param alg JWA Algorithm Identifier to be used with the generated key pair.
 * @param options Additional options passed down to the key pair generation.
 */
export default function generateKeyPair(alg: string, options?: GenerateKeyPairOptions): Promise<{
    privateKey: CryptoKey | KeyObject;
    publicKey: CryptoKey | KeyObject;
}>;
