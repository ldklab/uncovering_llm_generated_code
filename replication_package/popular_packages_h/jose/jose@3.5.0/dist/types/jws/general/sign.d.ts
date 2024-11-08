import type { KeyLike, GeneralJWS, JWSHeaderParameters, SignOptions } from '../../types.d';
export interface Signature {
    /**
     * Sets the JWS Protected Header on the Signature object.
     *
     * @param protectedHeader JWS Protected Header.
     */
    setProtectedHeader(protectedHeader: JWSHeaderParameters): Signature;
    /**
     * Sets the JWS Unprotected Header on the Signature object.
     *
     * @param unprotectedHeader JWS Unprotected Header.
     */
    setUnprotectedHeader(unprotectedHeader: JWSHeaderParameters): Signature;
}
/**
 * The GeneralSign class is a utility for creating General JWS objects.
 *
 * @example
 * ```
 * // ESM import
 * import GeneralSign from 'jose/jws/general/sign'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: GeneralSign } = require('jose/jws/general/sign')
 * ```
 *
 * @example
 * ```
 * // usage
 * import parseJwk from 'jose/jwk/parse'
 *
 * const encoder = new TextEncoder()
 * const ecPrivateKey = await parseJwk({
 *   alg: 'ES256',
 *   crv: 'P-256',
 *   kty: 'EC',
 *   d: 'VhsfgSRKcvHCGpLyygMbO_YpXc7bVKwi12KQTE4yOR4',
 *   x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
 *   y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo'
 * })
 * const rsaPrivateKey = await parseJwk({
 *   alg: 'PS256',
 *   e: 'AQAB',
 *   n: 'vwKaDQxZtTDZVzoKmpzNNh5lG-tweqG_52qBRihiHPDqbvEDdM0GMFH6QVC7BZb_7lXvQ1QSYL8CWkigMuebx6LoCwCazsQ_IpaOYfmjkEAQ8HmXaRM5LyZ8Nch8iajgMSZkOTGi-15kLBskaM2VhC4l8WSVykgLqI196N1pd969xIXgweBqH1DJnLJoz5395j2b9SFRdu0VXIWzFtGA4DQmastcRvF-3McTebWTnTWVpEQPu-GixYbDyAtyjnVW7e2nfV0xoShYbFqWSJ4XwkbG7y8_mjsRL140LMHmq9mGR1WvF-KeT59iy5gg-63LXnUcTyAg45bMjH-ZRtlZ5Q',
 *   d: 'M4srMPw1NPzSmYQzGlfX1JPNKwSUnLMLSxJlgh4ho7erO3bUPO-ajO2CP5_eZ_rAY3tTDnMgZnUE2IIioLn5Qp0GSvnFzKgOdXH1SCEKb0GqkInvPs6OLtgOyqCoYqlsnjbC8uAfH__vvisw3wsjHsEpQgOnnCdm5fwQjwc4j7zWby-EY0xFS8rUnfU6hSJ9Uw73ztftZuTXbmLFc5bw2mnAEuX18R9GVqduxRIqZQZfgUpmE5MbL8YBee3pZ51zjAa98z42kGS_0A33kXlXzcFDMd21cnfpZGKtIrigmTKabnc6MFZxaotmTaJqYUK58angQ3MkjTqMuj81JKRW4Q',
 *   p: '-hAX8Gm_6xyIfo3v2pj6k9iaf7S8_vf8Hh05BrTpYHBb0FvnPxsm9vEd4H4BOKBQjoT5biXZpgCdTyLxvo1USrf0ocs3BHfBraSG_ohMlpjaR_biALz8tKOdlsAZIoUBwFMigdDfeOCnBtGao2UcyiYVPw4p5Nd-T36xRV7fMB0',
 *   q: 'w4uUhbhWGt4-ibmwf2Kdaiz1PxyCxnZICBCGreH3WTvayjrAYEr_TVbMOU0_Bj7KagJxcwTEN2HlfFjLUDAatH8gwgmUPJzh5PmgJvOQJpKLVGGKU-xwDt2nbzZ3W0do8HtoC-rlL3cX9itmOI8YcxCRv4B1zrj5we53pH5itmk',
 *   dp: 'TLxJjFX3Nd_Qpv1JYExXgK0UZCIDaT6SGG-hQ0Sa5SQ1mI_LO5tKbrb5Ex23pDfV4JY_sKRe0MkZfOJdSrs15aPjpw6kOHPDdFSrtEoBLqmDOlgxbEaSSaB3yH30eJpWOj2ItktxeDeAKeCCUqfBmOrs1Ce1hWr3cM-Q-JevZ6U',
 *   dq: 'XIE8aqHQgfdfCFJCr5BcPW01O3zmVLKB0ubWf42lMJ6DGyX9-c-gxNpp1DW5ud-ca9fqCWpY1IZIRLHQxIdtKrP1MDXN3Xqt1l9MpwCT0duDdBCMmrUAMdgjrBXNEu5OM219xB2D_BdPy5GuUtVG0LAm8rv3fyq8ZETGbpenZPk',
 *   qi: 'fsRY6JkXC2exI5Df16QnHO85T7QXAOX4SQbyF2jbiIqzyTrmIoMgxPeoFv26JqWjzaWtogIPLleFNA1EWpvtKwZQ8K0iCJZWoyCjYXUwhln1gaXjSRkecLL5_BUab8OmxmEChwDO95xyXd2r70ObaxqtLgpVqNERa-P2RArwMGQ',
 *   kty: 'RSA',
 * })
 *
 * const sign = new GeneralSign(encoder.encode('It’s a dangerous business, Frodo, going out your door.'))
 *
 * sign
 *   .addSignature(ecPrivateKey)
 *   .setProtectedHeader({ alg: 'ES256' })
 *
 * sign
 *   .addSignature(rsaPrivateKey)
 *   .setProtectedHeader({ alg: 'PS256' })
 *
 * const jws = await sign.sign()
 * ```
 */
export default class GeneralSign {
    private _payload;
    private _signatures;
    /**
     * @param payload Binary representation of the payload to sign.
     */
    constructor(payload: Uint8Array);
    addSignature(key: KeyLike, options?: SignOptions): Signature;
    /**
     * Signs and resolves the value of the General JWS object.
     */
    sign(): Promise<GeneralJWS>;
}
export type { KeyLike, GeneralJWS, JWSHeaderParameters };
