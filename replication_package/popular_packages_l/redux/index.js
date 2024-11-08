// Import necessary functions from Redux Toolkit
const { createSlice, configureStore } = require('@reduxjs/toolkit');

// Create a slice that will automatically generate action creators and action types
const counterSlice = createSlice({
  name: 'counter', // Name the slice
  initialState: { // Set the initial state
    value: 0,
  },
  // Define reducers with action handlers
  reducers: {
    incremented: (state) => {
      // Increase counter
      state.value += 1;
    },
    decremented: (state) => {
      // Decrease counter
      state.value -= 1;
    },
  },
});

// Extract action creators from the slice
const { incremented, decremented } = counterSlice.actions;

// Configure the store by passing in the reducer
const store = configureStore({
  reducer: counterSlice.reducer,
});

// Example implementation function
function exampleUsage() {
  // Subscribe to store updates and log the state
  store.subscribe(() => console.log('State updated:', store.getState()));

  // Dispatch actions to update the state
  store.dispatch(incremented());
  store.dispatch(incremented());
  store.dispatch(decremented());
}

// Run the example usage to see state updates
exampleUsage();

// Export store and actions for external usage (e.g., in a React app)
module.exports = { store, incremented, decremented };
