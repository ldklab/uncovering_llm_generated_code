import { Sha256 } from '@aws-crypto/sha256-browser';

// Create a new SHA-256 hash instance
const hash = new Sha256();

// Update the hash with the data to be hashed
hash.update('some data');

// Await the promise for the digest to get the hash result
const result = await hash.digest();
