// index.js
import React from 'react';

// Slot component is a simple wrapper that renders its children
export const Slot = ({ children }) => {
  return <>{children}</>;
};

// App.js
import React from 'react';
import { Slot } from './index';

// Button component uses the Slot component to render its children
const Button = ({ children }) => {
  return (
    <button>
      <Slot>{children}</Slot>
    </button>
  );
};

// App component renders a div containing two Button components
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

// Render the App component into the DOM element with id 'root'
ReactDOM.render(<App />, document.getElementById('root'));
