class DiffSequences {
  static diff(aLength, bLength, isCommon, foundSubsequence) {
    const N = aLength;
    const M = bLength;
    
    const delta = N - M;
    const size = N + M + 3; // Required size for V array
    const V = new Array(size).fill(-1);
    const path = new Array(size);
    const offset = M + 1;

    const threshold = Math.max(N, M);
    for (let D = 0; D <= threshold; D++) {
      for (let k = -D; k <= D; k += 2) {
        let x;
        if (k === -D || (k !== D && V[k - 1 + offset] < V[k + 1 + offset])) {
          x = V[k + 1 + offset]; // Case where x is from V[k+1]
        } else {
          x = V[k - 1 + offset] + 1; // Case where x is extended from V[k-1]
        }

        let y = x - k;
        while (x < N && y < M && isCommon(x, y)) {
          x++;
          y++;
        }

        V[k + offset] = x;

        if (x >= N && y >= M) {
          this.traceBack(path, offset, D, foundSubsequence, aLength, bLength);
          return;
        }

        path[k + offset] = { x, y, D };
      }
    }
  }

  static traceBack(path, offset, D, foundSubsequence, aLength, bLength) {
    let k = aLength - bLength;
    const subsequences = [];
  
    for (let d = D; d > 0; d--) {
      const { x, y } = path[k + offset];
  
      const prevX = path[k - 1 + offset]?.x || -1;
      const prevY = prevX - (k - 1);
  
      const prevX2 = path[k + 1 + offset]?.x || -1;
      const prevY2 = prevX2 - (k + 1);
  
      if (prevX2 !== -1 && (prevX === -1 || prevX < prevX2)) {
        prevX = prevX2;
        prevY = prevY2;
      }
  
      const nCommon = x - prevX - 1;
      if (nCommon > 0) {
        subsequences.unshift({
          nCommon,
          aCommon: prevX + 1,
          bCommon: prevY + 1
        });
      }
    
      k -= (x - prevX > y - prevY) ? 1 : -1;
    }
  
    subsequences.forEach(({ nCommon, aCommon, bCommon }) => {
      foundSubsequence(nCommon, aCommon, bCommon);
    });
  }
}

export default DiffSequences.diff;

// Usage example
const a = ['a', 'b', 'c', 'a', 'b', 'b', 'a'];
const b = ['c', 'b', 'a', 'b', 'a', 'c'];

function isCommon(aIndex, bIndex) {
  return a[aIndex] === b[bIndex];
}

function foundSubsequence(nCommon, aCommon, bCommon) {
  console.log(`foundSubsequence(${nCommon}, ${aCommon}, ${bCommon})`);
}

DiffSequences.diff(a.length, b.length, isCommon, foundSubsequence);
