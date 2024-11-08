// immutableStateManager.js

function produce(baseState, recipe) {
  const draftState = createDraft(baseState);
  recipe(draftState);
  return finalize(draftState);
}

function createDraft(base) {
  if (Array.isArray(base)) {
    return base.map(createDraft);
  }
  if (base !== null && typeof base === "object") {
    return Object.entries(base).reduce((draft, [key, value]) => {
      draft[key] = createDraft(value);
      return draft;
    }, {});
  }
  return base;
}

function finalize(draft) {
  if (Array.isArray(draft)) {
    return draft.map(finalize);
  }
  if (draft !== null && typeof draft === "object") {
    return Object.freeze(Object.entries(draft).reduce((finalObj, [key, value]) => {
      finalObj[key] = finalize(value);
      return finalObj;
    }, {}));
  }
  return draft;
}

// export produce function
module.exports = {
  produce
};

// Example usage
const { produce } = require('./immutableStateManager');

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
