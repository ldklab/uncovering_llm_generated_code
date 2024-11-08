// immer.js

function produce(baseState, recipe) {
  const draftState = createDraft(baseState);
  recipe(draftState);
  return finalize(draftState);
}

function createDraft(baseState) {
  if (Array.isArray(baseState)) {
    return baseState.map(createDraft);
  }
  if (baseState !== null && typeof baseState === "object") {
    const draft = {};
    for (const key in baseState) {
      draft[key] = createDraft(baseState[key]);
    }
    return draft;
  }
  return baseState;
}

function finalize(draftState) {
  if (Array.isArray(draftState)) {
    return draftState.map(finalize);
  }
  if (draftState !== null && typeof draftState === "object") {
    const finalizedObject = {};
    for (const key in draftState) {
      finalizedObject[key] = finalize(draftState[key]);
    }
    return Object.freeze(finalizedObject);
  }
  return draftState;
}

module.exports = {
  produce
};

// Example usage
const { produce } = require('./immer');

const originalState = [
  { name: "Luke", completed: false },
  { name: "Leia", completed: true }
];

const updatedState = produce(originalState, draft => {
  draft.push({ name: "Han", completed: false });
  draft[0].completed = true;
});

console.log(updatedState);
// [
//   { name: "Luke", completed: true },
//   { name: "Leia", completed: true },
//   { name: "Han", completed: false }
// ]
