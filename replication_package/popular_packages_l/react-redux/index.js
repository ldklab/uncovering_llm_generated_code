// This package assumes React and Redux are already installed as dependencies in your project.

const { createStore } = require('redux');
const React = require('react');
const ReactDOM = require('react-dom');
const { Provider, connect } = require('react-redux');

// Define initial state
const initialState = {
    count: 0
};

// Define a reducer
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

// Create a Redux store
const store = createStore(counterReducer);

// Define a React component
class Counter extends React.Component {
    render() {
        const { count, increment, decrement } = this.props;
        return (
            <div>
                <h1>Counter: {count}</h1>
                <button onClick={increment}>Increment</button>
                <button onClick={decrement}>Decrement</button>
            </div>
        );
    }
}

// Map state and dispatch to props
const mapStateToProps = state => ({
    count: state.count
});

const mapDispatchToProps = dispatch => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
});

// Connect the component to Redux
const ConnectedCounter = connect(mapStateToProps, mapDispatchToProps)(Counter);

// Render the application
ReactDOM.render(
    <Provider store={store}>
        <ConnectedCounter />
    </Provider>,
    document.getElementById('root')
);
