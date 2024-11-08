import { Sha256 } from '@aws-crypto/sha256-browser';

// Create a new SHA-256 hash instance
const hashInstance = new Sha256();

// Add data to be hashed
hashInstance.update('some data');

// Compute the hash digest
const hashedResult = await hashInstance.digest(); 
