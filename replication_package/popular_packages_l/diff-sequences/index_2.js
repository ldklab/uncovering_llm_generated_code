class DiffSequences {
  static diff(aLength, bLength, isCommon, foundSubsequence) {
    // Initial setup for Myers' O(ND) linear space algorithm
    const N = aLength;
    const M = bLength;
    const delta = N - M;
    const size = N + M + 3;
    const fp = new Array(size).fill(-1);
    const path = new Array(size);
    const offset = M + 1;
    const V = { '0': 0 };
    const trace = [ { '0': 0 } ];
    
    let D = 0;
    const threshold = Math.max(N, M);

    // Look for shortest edit script D
    for (D = 0; D <= threshold; D++) {
      for (let k = -D; k <= D; k += 2) {
        let x, y;
        if (k === -D || (k !== D && V[k - 1] < V[k + 1])) {
          x = V[k + 1];
        } else {
          x = V[k - 1] + 1;
        }
        
        y = x - k;
        
        // Extend current string match as far as possible
        while (x < N && y < M && isCommon(x, y)) {
          x++;
          y++;
        }
        
        V[k] = x;
        path[k] = { x, y, D };
        
        // If end of both sequences reached
        if (x >= N && y >= M) {
          this.traceBack(path, offset, D, foundSubsequence, aLength, bLength);
          return;
        }
      }
      trace[D] = Object.assign({}, V);
    }
  }

  static traceBack(path, offset, D, foundSubsequence, aLength, bLength) {
    // Reconstruct path and trigger foundSubsequence callback
    let k = aLength - bLength;
    const subsequences = [];

    for (let d = D; d > 0; d--) {
      const p = path[k];
      const { x, y } = p;

      let prevX = k > -(d - 1) && path[k - 1] ? path[k - 1].x : -1;
      let prevY = prevX - (k - 1);

      let prevX2 = k < (d - 1) && path[k + 1] ? path[k + 1].x : -1;
      let prevY2 = prevX2 - (k + 1);

      // Determine path taken
      if (prevX2 !== -1 && (prevX === -1 || prevX < prevX2)) {
        prevX = prevX2;
        prevY = prevY2;
      }
      
      const nCommon = x - prevX - 1;
      if (nCommon > 0) {
        subsequences.unshift({
          nCommon: x - prevX - 1,
          aCommon: prevX + 1,
          bCommon: prevY + 1
        });
      }
      k -= (x - prevX > y - prevY) ? 1 : -1;
    }
    
    subsequences.forEach(e => {
      foundSubsequence(e.nCommon, e.aCommon, e.bCommon);
    });
  }
}

function isCommon(aIndex, bIndex) {
  return a[aIndex] === b[bIndex];
}

function foundSubsequence(nCommon, aCommon, bCommon) {
  console.log(`foundSubsequence(${nCommon}, ${aCommon}, ${bCommon})`);
}

export default DiffSequences.diff;

const a = ['a', 'b', 'c', 'a', 'b', 'b', 'a'];
const b = ['c', 'b', 'a', 'b', 'a', 'c'];

DiffSequences.diff(a.length, b.length, isCommon, foundSubsequence);
