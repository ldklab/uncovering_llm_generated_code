json
// package.json
{
  "name": "react-testing-library-example",
  "version": "1.0.0",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/dom": "^8.0.0",
    "@testing-library/jest-dom": "^5.0.0",
    "jest": "^28.0.0",
    "msw": "^0.35.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}

// src/HiddenMessage.js
import React, { useState } from 'react';

function HiddenMessage({ children }) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div>
      <label htmlFor="toggle">Show Message</label>
      <input
        id="toggle"
        type="checkbox"
        checked={showMessage}
        onChange={e => setShowMessage(e.target.checked)}
      />
      {showMessage && children}
    </div>
  );
}

export default HiddenMessage;

// src/__tests__/hidden-message.js
import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import HiddenMessage from '../HiddenMessage';

test('toggles message visibility', () => {
  const testMessage = 'Test Message';
  render(<HiddenMessage>{testMessage}</HiddenMessage>);

  expect(screen.queryByText(testMessage)).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(/show/i));
  expect(screen.getByText(testMessage)).toBeInTheDocument();
});

// src/Login.js
import React, { useReducer } from 'react';

function Login() {
  const initialState = { resolved: false, loading: false, error: null };
  const [state, setState] = useReducer((s, a) => ({ ...s, ...a }), initialState);

  function handleSubmit(event) {
    event.preventDefault();
    const { usernameInput, passwordInput } = event.target.elements;

    setState({ loading: true, resolved: false, error: null });

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value,
      }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(
        user => {
          setState({ loading: false, resolved: true, error: null });
          localStorage.setItem('token', user.token);
        },
        error => error.json().then(data => setState({ loading: false, error: data.message }))
      );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameInput">Username</label>
          <input id="usernameInput" />
        </div>
        <div>
          <label htmlFor="passwordInput">Password</label>
          <input id="passwordInput" type="password" />
        </div>
        <button type="submit">Submit{state.loading && '...'}</button>
      </form>
      {state.error && <div role="alert">{state.error}</div>}
      {state.resolved && <div role="alert">Congrats! You're signed in!</div>}
    </div>
  );
}

export default Login;

// src/__tests__/login.js
import '@testing-library/jest-dom';
import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, screen } from '@testing-library/react';
import Login from '../Login';

const fakeUserResponse = { token: 'fake_user_token' };
const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => res(ctx.json(fakeUserResponse)))
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.removeItem('token');
});
afterAll(() => server.close());

test('handles successful login', async () => {
  render(<Login />);

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'chuck' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'norris' } });

  fireEvent.click(screen.getByText(/submit/i));

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/congrats/i);
  expect(localStorage.getItem('token')).toBe(fakeUserResponse.token);
});

test('handles server errors', async () => {
  server.use(
    rest.post('/api/login', (req, res, ctx) =>
      res(ctx.status(500), ctx.json({ message: 'Internal server error' })))
  );

  render(<Login />);

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'chuck' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'norris' } });

  fireEvent.click(screen.getByText(/submit/i));

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/internal server error/i);
  expect(localStorage.getItem('token')).toBeNull();
});
