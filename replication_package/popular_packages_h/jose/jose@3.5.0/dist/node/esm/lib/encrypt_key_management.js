import cekFactory, { bitLengths as cekLengths } from '../lib/cek.js';
import { JOSENotSupported } from '../util/errors.js';
import random from '../runtime/random.js';
import { wrap as aesKw } from '../runtime/aeskw.js';
import * as ECDH from '../runtime/ecdhes.js';
import { encrypt as pbes2Kw } from '../runtime/pbes2kw.js';
import { encrypt as rsaEs } from '../runtime/rsaes.js';
import { wrap as aesGcmKw } from '../runtime/aesgcmkw.js';
import { encode as base64url } from '../runtime/base64url.js';
const generateCek = cekFactory(random);
async function encryptKeyManagement(alg, enc, key, providedCek, providedParameters = {}) {
    let encryptedKey;
    let parameters;
    let cek;
    switch (alg) {
        case 'dir': {
            cek = key;
            break;
        }
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            if (!ECDH.ecdhAllowed(key)) {
                throw new JOSENotSupported('ECDH-ES with the provided key is not allowed or not supported by your javascript runtime');
            }
            const { apu, apv } = providedParameters;
            let { epk: ephemeralKey } = providedParameters;
            ephemeralKey || (ephemeralKey = await ECDH.generateEpk(key));
            const epk = await ECDH.ephemeralKeyToPublicJWK(ephemeralKey);
            const sharedSecret = await ECDH.deriveKey(key, ephemeralKey, alg === 'ECDH-ES' ? enc : alg, parseInt(alg.substr(-5, 3), 10) || cekLengths.get(enc), apu, apv);
            parameters = { epk };
            if (apu)
                parameters.apu = base64url(apu);
            if (apv)
                parameters.apv = base64url(apv);
            if (alg === 'ECDH-ES') {
                cek = sharedSecret;
                break;
            }
            cek = providedCek || (await generateCek(enc));
            const kwAlg = alg.substr(-6);
            encryptedKey = await aesKw(kwAlg, sharedSecret, cek);
            break;
        }
        case 'RSA1_5':
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512': {
            cek = providedCek || (await generateCek(enc));
            encryptedKey = await rsaEs(alg, key, cek);
            break;
        }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW': {
            cek = providedCek || (await generateCek(enc));
            const { p2c, p2s } = providedParameters;
            ({ encryptedKey, ...parameters } = await pbes2Kw(alg, key, cek, p2c, p2s));
            break;
        }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW': {
            cek = providedCek || (await generateCek(enc));
            encryptedKey = await aesKw(alg, key, cek);
            break;
        }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW': {
            cek = providedCek || (await generateCek(enc));
            const { iv } = providedParameters;
            ({ encryptedKey, ...parameters } = await aesGcmKw(alg, key, cek, iv));
            break;
        }
        default: {
            throw new JOSENotSupported('unsupported or invalid "alg" (JWE Algorithm) header value');
        }
    }
    return { cek, encryptedKey, parameters };
}
export default encryptKeyManagement;
