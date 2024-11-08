typescript
import { createSelector } from 'reselect';

interface RootState {
  todos: { id: number; completed: boolean }[];
  alerts: { id: number; read: boolean }[];
}

const initialState: RootState = {
  todos: [
    { id: 0, completed: false },
    { id: 1, completed: true }
  ],
  alerts: [
    { id: 0, read: false },
    { id: 1, read: true }
  ]
};

// Input Selector
const getTodos = (state: RootState) => state.todos;

// Memoized Selector
const getCompletedTodos = createSelector(
  [getTodos],
  todosList => todosList.filter(todo => todo.completed)
);

console.log(getCompletedTodos(initialState)); // First call, processes data
console.log(getCompletedTodos(initialState)); // Second call, uses memoized result
