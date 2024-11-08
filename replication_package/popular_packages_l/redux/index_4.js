// Import Redux Toolkit functions for creating slices and configuring the store
const { createSlice, configureStore } = require('@reduxjs/toolkit');

// Define a slice for the counter with initial state and reducers
const counterSlice = createSlice({
  name: 'counter', // Identify the slice
  initialState: {
    value: 0, // Initial value for the counter
  },
  reducers: {
    // Reducer to increment the counter
    increment: (state) => {
      state.value += 1;
    },
    // Reducer to decrement the counter
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

// Extract generated action creators for later use
const { increment, decrement } = counterSlice.actions;

// Setup the Redux store with the counter slice reducer
const store = configureStore({
  reducer: counterSlice.reducer,
});

// Demonstrate the use of the store and actions
function demonstrateCounter() {
  // Log changes to the store state
  store.subscribe(() => console.log('Current state:', store.getState()));

  // Dispatch actions to modify the state
  store.dispatch(increment());
  store.dispatch(increment());
  store.dispatch(decrement());
}

// Execute demonstration function
demonstrateCounter();

// Export the store and actions for usage in other parts of an application
module.exports = { store, increment, decrement };
