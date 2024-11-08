// immer.js

function produce(baseState, recipe) {
  const draftState = createDraft(baseState);
  recipe(draftState);
  return finalize(draftState);
}

function createDraft(base) {
  if (Array.isArray(base)) return base.map(createDraft);
  if (base !== null && typeof base === "object") {
    const draft = {};
    for (const key in base) {
      draft[key] = createDraft(base[key]);
    }
    return draft;
  }
  return base;
}

function finalize(draft) {
  if (Array.isArray(draft)) return draft.map(finalize);
  if (draft !== null && typeof draft === "object") {
    const finalObject = {};
    for (const key in draft) {
      finalObject[key] = finalize(draft[key]);
    }
    return Object.freeze(finalObject);
  }
  return draft;
}

// export produce function
module.exports = {
  produce
};

// Example usage
const { produce } = require('./immer');

const baseState = [
  { name: "Luke", completed: false },
  { name: "Leia", completed: true }
];

const nextState = produce(baseState, draft => {
  draft.push({ name: "Han", completed: false });
  draft[0].completed = true;
});

console.log(nextState);
// [
//   { name: "Luke", completed: true },
//   { name: "Leia", completed: true },
//   { name: "Han", completed: false }
// ]
