import { Sha256 } from '@aws-crypto/sha256-browser';

async function generateHash(data) {
  const hash = new Sha256();
  hash.update(data);
  return await hash.digest();
}

(async () => {
  const data = 'some data';
  const result = await generateHash(data);
  console.log(result);
})();
