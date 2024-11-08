typescript
import { createSelector } from 'reselect';

// Define the interface for the application state
interface RootState {
  todos: { id: number; completed: boolean }[];
  alerts: { id: number; read: boolean }[];
}

// Initialize the state with sample data
const state: RootState = {
  todos: [
    { id: 0, completed: false },
    { id: 1, completed: true }
  ],
  alerts: [
    { id: 0, read: false },
    { id: 1, read: true }
  ]
};

// Define an input selector to extract todos from the state
const selectTodos = (state: RootState) => state.todos;

// Define a memoized selector to filter completed todos
const selectCompletedTodos = createSelector(
  [selectTodos],
  todos => todos.filter(todo => todo.completed)
);

// Use the memoized selector
console.log(selectCompletedTodos(state)); // Computes and logs completed todos
console.log(selectCompletedTodos(state)); // Returns cached result and logs it
