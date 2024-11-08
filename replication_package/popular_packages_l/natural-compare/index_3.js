(function(global) {
    "use strict";

    // Optionally set default alphabet
    String.alphabet = null;

    function naturalCompare(a, b) {
        const alphabet = String.alphabet;
        let idxA = 0, idxB = 0, charA, charB, numA, numB;

        const getChar = (string, idx) => (
            alphabet ? alphabet.indexOf(string.charAt(idx)) + 1 || 0 : string.charCodeAt(idx) || 0
        );

        const isDigit = code => code >= 48 && code <= 57;

        function compareTokens(a, b) {
            let result = 0;

            while (!result && (charA = getChar(a, idxA)) && (charB = getChar(b, idxB))) {
                if (isDigit(charA) && isDigit(charB)) {
                    numA = numB = '';
                    do { numA += a[idxA++]; } while (isDigit(getChar(a, idxA)));
                    do { numB += b[idxB++]; } while (isDigit(getChar(b, idxB)));
                    numA = parseInt(numA, 10);
                    numB = parseInt(numB, 10);
                    result = numA < numB ? -1 : numB < numA ? 1 : 0;
                } else {
                    result = charA < charB ? -1 : charB < charA ? 1 : 0;
                    idxA++;
                    idxB++;
                }
            }
            return result || (a.length - b.length);
        }

        return compareTokens(a, b);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = naturalCompare;
    } else {
        String.naturalCompare = naturalCompare;
    }
})(this);

// Usage and test cases
if (require.main === module) {
    const arr = ["z1.doc", "z10.doc", "z17.doc", "z2.doc", "z23.doc", "z3.doc"];
    arr.sort(String.naturalCompare);
    console.log(arr); // ["z1.doc", "z2.doc", "z3.doc", "z10.doc", "z17.doc", "z23.doc"]

    // Usage with case insensitivity
    arr.sort((a, b) => String.naturalCompare(a.toLowerCase(), b.toLowerCase()));
    console.log(arr);

    // Set up a custom alphabet
    String.alphabet = "abcčdeéfghiijklmnoprstuüõöxy";
    const alphArr = ["t", "z", "x", "õ"];
    alphArr.sort(String.naturalCompare);
    console.log(alphArr); // Custom order
}
