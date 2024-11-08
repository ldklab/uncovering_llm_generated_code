// index.js
import React from 'react';

export const ContentWrapper = ({ children }) => {
  return <>{children}</>;
};

// App.js
import React from 'react';
import { ContentWrapper } from './index';

const CustomButton = ({ children }) => {
  return (
    <button>
      <ContentWrapper>{children}</ContentWrapper>
    </button>
  );
};

export const App = () => {
  return (
    <div>
      <CustomButton>
        <span>Click Me!</span>
      </CustomButton>
      <CustomButton>
        <img src="icon.png" alt="icon" /> Submit
      </CustomButton>
    </div>
  );
};

// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

ReactDOM.render(<App />, document.getElementById('root'));
