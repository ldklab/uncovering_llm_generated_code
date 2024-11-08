  import { Sha256 } from '@aws-crypto/sha256-browser';

  const hash = new Sha256();
  hash.update('some data');
  const result = await hash.digest();
  