class DiffSequences {
  static diff(aLength, bLength, isCommon, foundSubsequence) {
    // Myers' O(ND) linear space algorithm for diffing sequences
    const N = aLength, M = bLength, delta = N - M;
    const fp = new Array(N + M + 3).fill(-1);
    const path = new Array(N + M + 3);
    const V = { '0': 0 };
    const offset = M + 1;

    for (let D = 0; D <= Math.max(N, M); D++) {
      for (let k = -D; k <= D; k += 2) {
        let x = (k === -D || (k !== D && V[k - 1] < V[k + 1])) ? V[k + 1] : V[k - 1] + 1;
        let y = x - k;

        // Extend the D-path as far as common subsequences allow
        while (x < N && y < M && isCommon(x, y)) {
          x++;
          y++;
        }

        V[k] = x;
        path[k] = { x, y, D };

        // Successful match completion
        if (x >= N && y >= M) {
          this.traceBack(path, offset, D, foundSubsequence, aLength, bLength);
          return;
        }
      }
    }
  }

  static traceBack(path, offset, D, foundSubsequence, aLength, bLength) {
    let k = aLength - bLength;
    const subsequences = [];

    for (let d = D; d > 0; d--) {
      const p = path[k], { x, y } = p;
      let prevK1 = k - 1, prevK2 = k + 1;
      let prevX1 = path[prevK1] ? path[prevK1].x : -1;
      let prevY1 = prevX1 - prevK1;
      let prevX2 = path[prevK2] ? path[prevK2].x : -1;
      let prevY2 = prevX2 - prevK2;

      if (prevX2 !== -1 && (prevX1 === -1 || prevX1 < prevX2)) {
        prevX1 = prevX2;
        prevY1 = prevY2;
      }

      if (x - prevX1 > 1) {
        subsequences.unshift({
          nCommon: x - prevX1 - 1,
          aCommon: prevX1 + 1,
          bCommon: prevY1 + 1
        });
      }

      k -= (x - prevX1 > y - prevY1) ? 1 : -1;
    }

    subsequences.forEach(({ nCommon, aCommon, bCommon }) => {
      foundSubsequence(nCommon, aCommon, bCommon);
    });
  }
}

// Example usage
const a = ['a', 'b', 'c', 'a', 'b', 'b', 'a'];
const b = ['c', 'b', 'a', 'b', 'a', 'c'];

function isCommon(aIndex, bIndex) {
  return a[aIndex] === b[bIndex];
}

function foundSubsequence(nCommon, aCommon, bCommon) {
  console.log(`foundSubsequence(${nCommon}, ${aCommon}, ${bCommon})`);
}

DiffSequences.diff(a.length, b.length, isCommon, foundSubsequence);
