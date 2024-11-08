typescript
import { createSelector } from 'reselect';

// Define the application state shape
interface RootState {
  todos: { id: number; completed: boolean }[];
  alerts: { id: number; read: boolean }[];
}

// Sample state initialized with todos and alerts
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

// Input Selector to extract todos from the state
const selectTodos = (state: RootState) => state.todos;

// Memoized Selector to filter and return completed todos
const selectCompletedTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter((todo) => todo.completed)
);

// Logging completed todos
console.log(selectCompletedTodos(state)); // First run, calculates
console.log(selectCompletedTodos(state)); // Second run, returns cached result
