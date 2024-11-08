const { createStore } = require('redux');
const React = require('react');
const ReactDOM = require('react-dom');
const { Provider, connect } = require('react-redux');

// Initial state setup
const initialState = { count: 0 };

// Reducer function to handle actions
const counterReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INCREMENT': return { count: state.count + 1 };
        case 'DECREMENT': return { count: state.count - 1 };
        default: return state;
    }
};

// Create Redux store
const store = createStore(counterReducer);

// Counter component
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

// Map state and actions to component props
const mapStateToProps = (state) => ({ count: state.count });
const mapDispatchToProps = (dispatch) => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
});

// Connect component to Redux
const ConnectedCounter = connect(mapStateToProps, mapDispatchToProps)(Counter);

// Render the app
ReactDOM.render(
    <Provider store={store}>
        <ConnectedCounter />
    </Provider>,
    document.getElementById('root')
);
