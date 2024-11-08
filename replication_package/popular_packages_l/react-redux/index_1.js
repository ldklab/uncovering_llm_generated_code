const { createStore } = require('redux');
const React = require('react');
const ReactDOM = require('react-dom');
const { Provider, connect } = require('react-redux');

// Initial state setup
const initialState = { count: 0 };

// Reducer function to handle state changes
const counterReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return { ...state, count: state.count + 1 };
        case 'DECREMENT':
            return { ...state, count: state.count - 1 };
        default:
            return state;
    }
};

// Create Redux store
const store = createStore(counterReducer);

// React Component to display counter and buttons
const Counter = ({ count, increment, decrement }) => (
    <div>
        <h1>Counter: {count}</h1>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
    </div>
);

// Connect Redux state and dispatch to component props
const mapStateToProps = state => ({ count: state.count });
const mapDispatchToProps = dispatch => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
});

// Connecting the component
const ConnectedCounter = connect(mapStateToProps, mapDispatchToProps)(Counter);

// Render application with Redux Provider
ReactDOM.render(
    <Provider store={store}>
        <ConnectedCounter />
    </Provider>,
    document.getElementById('root')
);
