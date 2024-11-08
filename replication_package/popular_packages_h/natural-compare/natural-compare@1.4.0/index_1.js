/*
 * @version    1.4.0
 * @date       2015-10-26
 * @stability  3 - Stable
 * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
 * @license    MIT License
 */

function naturalCompare(a, b) {
    let posA = 0, posB = 0;
    const alphabet = String.alphabet || '';

    function getCode(str, pos) {
        let code = str.charCodeAt(pos) || 0;
        if (alphabet) {
            const customIndex = alphabet.indexOf(str.charAt(pos));
            if (customIndex > -1) return customIndex + 76;
        }
        if (code < 45 || code > 127) return code;
        if (code < 46) return 65;
        if (code < 48) return code - 1;
        if (code < 58) return code + 18; // numbers
        if (code < 65) return code - 11;
        if (code < 91) return code + 11; // uppercase
        if (code < 97) return code - 37;
        if (code < 123) return code + 5; // lowercase
        return code - 63; // beyond 'z'
    }

    a += '';
    b += '';
    while (true) {
        const codeA = getCode(a, posA++);
        const codeB = getCode(b, posB++);

        if (!codeA || !codeB || codeA !== codeB) {
            return codeA < codeB ? -1 : codeA > codeB ? 1 : 0;
        }

        if (codeA < 76 && codeA > 66) {
            const startA = posA, startB = posB;
            while (getCode(a, posA) < 76 && getCode(a, posA) > 65) posA++;
            while (getCode(b, posB) < 76 && getCode(b, posB) > 65) posB++;

            const numA = parseInt(a.slice(startA - 1, posA));
            const numB = parseInt(b.slice(startB - 1, posB));

            if (numA !== numB) {
                return numA < numB ? -1 : 1;
            }
        }
    }
}

try {
    module.exports = naturalCompare;
} catch (e) {
    String.naturalCompare = naturalCompare;
}
