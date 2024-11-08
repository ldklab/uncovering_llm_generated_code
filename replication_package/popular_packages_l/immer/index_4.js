// Description:
// This Node.js code mimics behavior similar to the `immer` library, allowing for immutable state updates.
// It provides a `produce` function that takes a base state and a mutation function (recipe) to create a new immutable state.

function produce(baseState, recipe) {
  const draftState = createDraft(baseState); // Create a draft version of the base state
  recipe(draftState); // Apply recipe function to modify draft
  return finalize(draftState); // Finalize and freeze the draft to produce new immutable state
}

function createDraft(base) {
  if (Array.isArray(base)) return base.map(createDraft); // If base state is an array, map each element to a draft
  if (base !== null && typeof base === "object") {
    const draft = {};
    for (const key in base) {
      draft[key] = createDraft(base[key]); // Recursively create draft for each property
    }
    return draft; // return the draft object
  }
  return base; // Return base value for non-object, non-array values
}

function finalize(draft) {
  if (Array.isArray(draft)) return draft.map(finalize); // If draft is an array, finalize each element
  if (draft !== null && typeof draft === "object") {
    const finalObject = {};
    for (const key in draft) {
      finalObject[key] = finalize(draft[key]); // Recursively finalize each property
    }
    return Object.freeze(finalObject); // Freeze the finalized object to make it immutable
  }
  return draft; // Return final draft value for non-object, non-array values
}

// Export the produce function
module.exports = {
  produce
};

// Example usage demonstrating the produce function
const { produce } = require('./immer');

const baseState = [
  { name: "Luke", completed: false },
  { name: "Leia", completed: true }
];

const nextState = produce(baseState, draft => {
  draft.push({ name: "Han", completed: false }); // Add new item to draft
  draft[0].completed = true; // Modify draft state
});

// Output the newly produced state
console.log(nextState);
// The resulting state is a new immutable array with the desired updates:
// [
//   { name: "Luke", completed: true },
//   { name: "Leia", completed: true },
//   { name: "Han", completed: false }
// ]
