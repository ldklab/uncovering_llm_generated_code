jsx
// index.js
import React from 'react';

export const Slot = ({ children }) => {
  return <>{children}</>;
};

// App.js
import React from 'react';
import { Slot } from './index';

const Button = ({ children }) => {
  return (
    <button>
      <Slot>{children}</Slot>
    </button>
  );
};

export const App = () => {
  return (
    <div>
      <Button>
        <span>Click Me!</span>
      </Button>
      <Button>
        <img src="icon.png" alt="icon" /> Submit
      </Button>
    </div>
  );
};

// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

ReactDOM.render(<App />, document.getElementById('root'));
