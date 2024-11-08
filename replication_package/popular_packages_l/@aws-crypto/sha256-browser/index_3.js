import { Sha256 } from '@aws-crypto/sha256-browser';

async function computeHash(data) {
  const hash = new Sha256();
  hash.update(data);
  const result = await hash.digest();
  return result;
}

(async () => {
  const data = 'some data';
  const hashResult = await computeHash(data);
  console.log(hashResult);
})();
