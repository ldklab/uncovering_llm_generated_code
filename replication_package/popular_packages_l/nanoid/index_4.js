import crypto from 'crypto';

const urlAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function getRandomBytes(size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
}

async function nanoid(size = 21, alphabet = urlAlphabet) {
  const bytes = await getRandomBytes(size);
  const mask = (2 << Math.floor(Math.log2(alphabet.length - 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);
  let id = '';

  while (true) {
    const random = await getRandomBytes(step);
    for (let i = 0; i < step; i++) {
      const byte = random[i] & mask;
      if (alphabet[byte]) {
        id += alphabet[byte];
        if (id.length === size) return id;
      }
    }
  }
}

function nonSecureNanoid(size = 21, alphabet = urlAlphabet) {
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

function customAlphabet(alphabet, size = 21) {
  return () => nonSecureNanoid(size, alphabet);
}

function customRandom(alphabet, size, random) {
  return () => {
    let id = '';
    for (let i = 0; i < size; i++) {
      id += alphabet[random(size)];
    }
    return id;
  }
}

async function example() {
  try {
    console.log('Secure NanoID:', await nanoid());
    console.log('Non-secure NanoID:', nonSecureNanoid());
    const createCustomId = customAlphabet('abcdef', 10);
    console.log('Custom Alphabet ID:', createCustomId());
  } catch (error) {
    console.error(error);
  }
}

example();

export {
  nanoid,
  nonSecureNanoid,
  customAlphabet,
  customRandom,
  urlAlphabet
};
