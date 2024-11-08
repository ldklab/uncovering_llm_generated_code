// The provided code sets up a simple React-Redux application with a counter. It uses a Redux store to manage the state of a counter. 
// The counter can be incremented and decremented using buttons and the application uses React-Redux to connect React components to the Redux store.

const { createStore } = require('redux');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { Provider, connect } = require('react-redux');

// Initial state of the Redux store
const initialState = {
    count: 0
};

// Reducer function to handle actions and update the state
function counterReducer(state = initialState, action) {
    switch (action.type) {
        case 'INCREMENT':
            return { count: state.count + 1 };
        case 'DECREMENT':
            return { count: state.count - 1 };
        default:
            return state;
    }
}

// Create a Redux store with the defined reducer
const store = createStore(counterReducer);

// Define a React component to display the counter and buttons to interact with the state
function Counter({ count, increment, decrement }) {
    return (
        <div>
            <h1>Counter: {count}</h1>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
        </div>
    );
}

// Map Redux state to React component props
const mapStateToProps = state => ({
    count: state.count
});

// Map dispatch actions to component props
const mapDispatchToProps = dispatch => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
});

// Connect the Counter component to the Redux store
const ConnectedCounter = connect(mapStateToProps, mapDispatchToProps)(Counter);

// Render the connected component within the React-Redux Provider, passing the store to the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <ConnectedCounter />
    </Provider>
);
