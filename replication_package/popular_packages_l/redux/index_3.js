// Import necessary functions from Redux Toolkit
const { createSlice, configureStore } = require('@reduxjs/toolkit');

// Create a slice with initial state and reducers
const counterSlice = createSlice({
  name: 'counter', 
  initialState: { 
    value: 0,
  },
  reducers: {
    incremented: state => { state.value += 1 },
    decremented: state => { state.value -= 1 },
  },
});

// Extract action creators from the slice
const { incremented, decremented } = counterSlice.actions;

// Configure the Redux store using the slice's reducer
const store = configureStore({
  reducer: counterSlice.reducer,
});

// Function to demonstrate state updates and listening for changes
function demonstrateStateUpdates() {
  store.subscribe(() => console.log('State updated:', store.getState()));

  store.dispatch(incremented());
  store.dispatch(incremented());
  store.dispatch(decremented());
}

// Run the demonstration function
demonstrateStateUpdates();

// Export the store and actions for use in other parts of an application
module.exports = { store, incremented, decremented };
