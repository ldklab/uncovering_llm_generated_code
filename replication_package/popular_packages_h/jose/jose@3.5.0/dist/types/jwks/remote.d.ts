/// <reference types="node" />
import type * as http from 'http';
import type * as https from 'https';
import type { JWSHeaderParameters, FlattenedJWSInput, GetKeyFunction } from '../types.d';
/**
 * Options for the remote JSON Web Key Set.
 */
export interface RemoteJWKSetOptions {
    /**
     * Timeout for the HTTP request. When reached the request will be
     * aborted and the verification will fail. Default is 5000.
     */
    timeoutDuration?: number;
    /**
     * Duration for which no more HTTP requests will be triggered
     * after a previous successful fetch. Default is 30000.
     */
    cooldownDuration?: number;
    /**
     * An instance of http.Agent or https.Agent to pass to the http.get or
     * https.get method options. Use when behind an http(s) proxy.
     * This is a Node.js runtime specific option, it is ignored
     * when used outside of Node.js runtime.
     */
    agent?: https.Agent | http.Agent;
}
/**
 * Returns a function that resolves to a key object downloaded from a
 * remote endpoint returning a JSON Web Key Set, that is, for example,
 * an OAuth 2.0 or OIDC jwks_uri. Only a single public key must match
 * the selection process.
 *
 * @example
 * ```
 * // ESM import
 * import createRemoteJWKSet from 'jose/jwks/remote'
 * ```
 *
 * @example
 * ```
 * // CJS import
 * const { default: createRemoteJWKSet } = require('jose/jwks/remote')
 * ```
 *
 * @example
 * ```
 * // usage
 * import jwtVerify from 'jose/jwt/verify'
 *
 * const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
 *
 * const { payload, protectedHeader } = await jwtVerify(jwt, JWKS, {
 *   issuer: 'urn:example:issuer',
 *   audience: 'urn:example:audience'
 * })
 * console.log(protectedHeader)
 * console.log(payload)
 * ```
 *
 * @param url URL to fetch the JSON Web Key Set from.
 * @param options Options for the remote JSON Web Key Set.
 */
export default function createRemoteJWKSet(url: URL, options?: RemoteJWKSetOptions): GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;
