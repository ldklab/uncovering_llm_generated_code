typescript
import { createSelector } from 'reselect';

interface RootState {
  todos: { id: number; completed: boolean }[];
  alerts: { id: number; read: boolean }[];
}

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

// Input Selector to retrieve todos array from the state
const selectTodos = (state: RootState) => state.todos;

// Memoized Selector to filter completed todos
const selectCompletedTodos = createSelector(
  [selectTodos],
  todos => todos.filter(todo => todo.completed)
);

console.log(selectCompletedTodos(state)); // Logs completed todos, calculates first time
console.log(selectCompletedTodos(state)); // Logs again, utilizes cache
