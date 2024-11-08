/*
 * @version    1.4.0
 * @date       2015-10-26
 * @stability  3 - Stable
 * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
 * @license    MIT License
 */

function naturalCompare(a, b) {
    let posA = 0, posB = 0;
    const alphabet = String.alphabet;

    function getCode(str, pos, code) {
        if (code) {
            let i;
            for (i = pos; (code = getCode(str, i)) < 76 && code > 65;) ++i;
            return +str.slice(pos - 1, i);
        }
        code = alphabet ? alphabet.indexOf(str.charAt(pos)) : -1;
        
        if (code > -1) return code + 76;
        
        code = str.charCodeAt(pos) || 0;
        if (code < 45 || code > 127) return code;
        if (code < 46) return 65;
        if (code < 48) return code - 1;
        if (code < 58) return code + 18;
        if (code < 65) return code - 11;
        if (code < 91) return code + 11;
        if (code < 97) return code - 37;
        if (code < 123) return code + 5;
        return code - 63;
    }

    a = String(a);
    b = String(b);

    while (true) {
        const codeA = getCode(a, posA++);
        const codeB = getCode(b, posB++);

        if (codeA < 76 && codeB < 76 && codeA > 66 && codeB > 66) {
            const tempA = getCode(a, posA, posA);
            const tempB = getCode(b, posB, posA);
            posA = posB = Math.max(posA, tempB);
        }

        if (codeA !== codeB) return codeA < codeB ? -1 : 1;
        if (!codeB) break;
    }
    return 0;
}

try {
    module.exports = naturalCompare;
} catch (e) {
    String.naturalCompare = naturalCompare;
}
