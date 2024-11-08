import crypto from 'crypto';

// Default URL-friendly alphabet
const defaultAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// Function to get secure random bytes
async function fetchRandomBytes(length) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (error, buffer) => {
      if (error) reject(error);
      else resolve(buffer);
    });
  });
}

// Secure Nanoid generation
async function generateSecureId(length = 21, alphabet = defaultAlphabet) {
  const secureBytes = await fetchRandomBytes(length);
  const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1;
  const extraBytes = Math.ceil((1.6 * mask * length) / alphabet.length);
  let result = '';

  while (true) {
    const randBytes = await fetchRandomBytes(extraBytes);
    for (let i = 0; i < randBytes.length; i++) {
      const index = randBytes[i] & mask;
      if (alphabet[index]) {
        result += alphabet[index];
        if (result.length === length) return result;
      }
    }
  }
}

// Non-secure Nanoid generation using Math.random
function generateNonSecureId(length = 21, alphabet = defaultAlphabet) {
  let result = '';
  while (length--)
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  return result;
}

// Function to create custom alphabet-based generator
function createCustomAlphabetId(alphabet, length = 21) {
  return () => generateNonSecureId(length, alphabet);
}

// Function to create custom random-based generator
function createCustomRandomId(alphabet, length, randomFunc) {
  return () => {
    let result = '';
    while (length--) {
      const randomIndex = randomFunc(length);
      result += alphabet[randomIndex];
    }
    return result;
  };
}

// Demonstration of ID generation
async function runExample() {
  console.log('Secure ID:', await generateSecureId());
  console.log('Non-secure ID:', generateNonSecureId());
  const customIdFunction = createCustomAlphabetId('abcdef', 10);
  console.log('Custom Alphabet ID:', customIdFunction());
}

runExample().catch(console.error);

export {
  generateSecureId as nanoid,
  generateNonSecureId as nonSecureNanoid,
  createCustomAlphabetId as customAlphabet,
  createCustomRandomId as customRandom,
  defaultAlphabet as urlAlphabet
};
