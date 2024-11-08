const { createStore } = require('redux');
const React = require('react');
const ReactDOM = require('react-dom');
const { Provider, connect } = require('react-redux');

const initialState = {
    count: 0
};

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

const store = createStore(counterReducer);

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

const mapStateToProps = state => ({
    count: state.count
});

const mapDispatchToProps = dispatch => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
});

const ConnectedCounter = connect(mapStateToProps, mapDispatchToProps)(Counter);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedCounter />
    </Provider>,
    document.getElementById('root')
);
