class DiffSequences {
  // Main method to compute the longest common subsequence
  static diff(aLength, bLength, isCommon, foundSubsequence) {
    const N = aLength; // Length of sequence a
    const M = bLength; // Length of sequence b
    
    const delta = N - M; // Difference in lengths
    const size = N + M + 3; // Total size for the arrays
    const fp = new Array(size).fill(-1); // Array to store furthest points
    const path = new Array(size); // Array to store the path of solutions
    const offset = M + 1; // Offset value for indexing

    const V = {'0': 0}; // Map to store positions
    const trace = [{'0': 0}]; // Trace of maps to keep track of solutions
    
    let D = 0;
    const threshold = Math.max(N, M); // Maximum number of solutions to explore

    // Iterating over diagonal slices D
    for (D = 0; D <= threshold; D++) {
      // Iterate over the possible lines within the slice
      for (let k = -D; k <= D; k += 2) {
        let x, y;

        // Deciding which path to extend
        if (k === -D || (k !== D && V[k - 1] < V[k + 1])) {
          x = V[k + 1];
        } else {
          x = V[k - 1] + 1;
        }
        
        y = x - k; // Calculate y based on x

        // Extend the path as long as matching elements are found
        while (x < N && y < M && isCommon(x, y)) {
          x++;
          y++;
        }
        
        V[k] = x;
        path[k] = { x, y, D };
        
        // If the entire sub-sequence is matched
        if (x >= N && y >= M) {
          this.traceBack(path, offset, D, foundSubsequence, aLength, bLength);
          return; // Stop further computations
        }
      }
      trace[D] = Object.assign({}, V);
    }
  }

  // Method to backtrack the path and call the subsequence found callback
  static traceBack(path, offset, D, foundSubsequence, aLength, bLength) {
    let k = aLength - bLength;
    const subsequences = [];

    // Start backtracking from the last 'D'
    for (let d = D; d > 0; d--) {
      const p = path[k];
      const { x, y } = p;

      let prevX = (k > -(d - 1) && path[k - 1]) ? path[k - 1].x : -1;
      let prevY = prevX - (k - 1);

      let prevX2 = (k < (d - 1) && path[k + 1]) ? path[k + 1].x : -1;
      let prevY2 = prevX2 - (k + 1);

      // Determine which path was selected based on previous paths
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

export default DiffSequences.diff;

// Example usage of the DiffSequences class
const a = ['a', 'b', 'c', 'a', 'b', 'b', 'a'];
const b = ['c', 'b', 'a', 'b', 'a', 'c'];

// Function to compare elements in sequences
function isCommon(aIndex, bIndex) {
  return a[aIndex] === b[bIndex];
}

// Callback function to log the found subsequence
function foundSubsequence(nCommon, aCommon, bCommon) {
  console.log(`foundSubsequence(${nCommon}, ${aCommon}, ${bCommon})`);
}

// Run the diff algorithm
DiffSequences.diff(a.length, b.length, isCommon, foundSubsequence);
