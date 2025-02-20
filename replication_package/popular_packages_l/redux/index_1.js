// Import necessary functions from Redux Toolkit
const { createSlice, configureStore } = require('@reduxjs/toolkit');

// Create a slice that encapsulates state, reducers, and action creators for counter functionality
const counterSlice = createSlice({
  name: 'counter', // Unique name for the slice
  initialState: { // Initial state value for the counter
    value: 0,
  },
  reducers: { // Reducers to handle state updates
    incremented: (state) => {
      state.value += 1; // Increment the counter
    },
    decremented: (state) => {
      state.value -= 1; // Decrement the counter
    },
  },
});

// Extract generated action creators from the slice
const { incremented, decremented } = counterSlice.actions;

// Configure the Redux store, using the slice's reducer
const store = configureStore({
  reducer: counterSlice.reducer, // Attach the slice's reducer
});

// Function demonstrating how the store and actions work
function exampleUsage() {
  // Subscribe to store changes and log the state whenever it updates
  store.subscribe(() => console.log('State updated:', store.getState()));
  
  // Dispatch actions to modify the state
  store.dispatch(incremented()); // Increment action
  store.dispatch(incremented()); // Increment again
  store.dispatch(decremented()); // Decrement action
}

// Execute the exampleUsage function to see the counter slice in action
exampleUsage();

// Export the store and action creators for use in other parts of the application
module.exports = { store, incremented, decremented };
