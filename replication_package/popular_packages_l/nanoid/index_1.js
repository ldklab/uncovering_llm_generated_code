import crypto from 'crypto';

// Default alphabet for URL-friendly IDs
const urlAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// Generate random bytes securely
function getRandomBytes(size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
}

// Nano ID function to generate secure IDs
async function nanoid(size = 21, alphabet = urlAlphabet) {
  const bytes = await getRandomBytes(size);
  let id = '';
  const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1;
  let step = Math.ceil((1.6 * mask * size) / alphabet.length);

  while (true) {
    const random = await getRandomBytes(step);
    let i = step;
    while (i--) {
      const byte = random[i] & mask;
      if (alphabet[byte]) {
        id += alphabet[byte];
        if (id.length === size) return id;
      }
    }
  }
}

// Non-secure Nano ID function using Math.random
function nonSecureNanoid(size = 21, alphabet = urlAlphabet) {
  let id = '';
  while (size--) {
    id += alphabet[(Math.random() * alphabet.length) | 0];
  }
  return id;
}

// Custom Alphabet Generator
function customAlphabet(alphabet, size = 21) {
  return () => nonSecureNanoid(size, alphabet);
}

// Custom Random ID Generator
function customRandom(alphabet, size, random) {
  return () => {
    let id = '';
    while (size--) {
      id += alphabet[random(size)];
    }
    return id;
  }
}

// Example usage
async function example() {
  console.log('Secure NanoID:', await nanoid());
  console.log('Non-secure NanoID:', nonSecureNanoid());
  const customId = customAlphabet('abcdef', 10);
  console.log('Custom Alphabet ID:', customId());
}

example().catch(console.error);

export {
  nanoid,
  nonSecureNanoid,
  customAlphabet,
  customRandom,
  urlAlphabet
};
