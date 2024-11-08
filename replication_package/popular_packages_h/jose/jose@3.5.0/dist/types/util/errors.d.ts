/**
 * A generic Error subclass that all other specific
 * JOSE Error subclasses inherit from.
 */
export declare class JOSEError extends Error {
    /**
     * A unique error code for the particular error subclass.
     */
    code: string;
    constructor(message?: string);
}
/**
 * An error subclass thrown when a JWT Claim Set member validation fails.
 */
export declare class JWTClaimValidationFailed extends JOSEError {
    code: string;
    /**
     * The Claim for which the validation failed.
     */
    claim: string;
    /**
     * Reason code for the validation failure.
     */
    reason: string;
    constructor(message: string, claim?: string, reason?: string);
}
/**
 * An error subclass thrown when a JOSE Algorithm is not allowed per developer preference.
 */
export declare class JOSEAlgNotAllowed extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when a particular feature or algorithm is not supported by this
 * implementation or JOSE in general.
 */
export declare class JOSENotSupported extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when a JWE ciphertext decryption fails.
 */
export declare class JWEDecryptionFailed extends JOSEError {
    code: string;
    message: string;
}
/**
 * An error subclass thrown when a JWE is invalid.
 */
export declare class JWEInvalid extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when a JWS is invalid.
 */
export declare class JWSInvalid extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when a JWT is invalid.
 */
export declare class JWTInvalid extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when a JWK is invalid.
 */
export declare class JWKInvalid extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when a JWKS is invalid.
 */
export declare class JWKSInvalid extends JOSEError {
    code: string;
}
/**
 * An error subclass thrown when no keys match from a JWKS.
 */
export declare class JWKSNoMatchingKey extends JOSEError {
    code: string;
    message: string;
}
/**
 * An error subclass thrown when multiple keys match from a JWKS.
 */
export declare class JWKSMultipleMatchingKeys extends JOSEError {
    code: string;
    message: string;
}
/**
 * An error subclass thrown when JWS signature verification fails.
 */
export declare class JWSSignatureVerificationFailed extends JOSEError {
    code: string;
    message: string;
}
/**
 * An error subclass thrown when a JWT is expired.
 */
export declare class JWTExpired extends JWTClaimValidationFailed {
    code: string;
}
