import React, { useState } from 'react';
import './App.css';
import LoginButton from './LoginButton';
import RegistrationButton from './RegistrationButton';
import PasskeyList from './PasskeyList';

function App() {
  const [username, setUsername] = useState(false);
  const [identifier, setIdentifier] = useState('');

  return (
    <div class="container">
      <header
        className="header"
      >
        <h1>JS Passkey Demo</h1>
        <div style={{}}>
          <input
            type="text"
            value={identifier}
            placeholder="username"
            onChange={(e) => setIdentifier(e.target.value)}
            className="search-input"
          />
          {username ? (
            <button className="custom-button" onClick={() => setUsername(false)}>
              Logout
            </button>
          ) : (
            <LoginButton className="custom-button" identifier={identifier} setUsername={setUsername} />
          )}
          <RegistrationButton className="custom-button" identifier={identifier} />
        </div>
        <h2>{username ? 'Signed in as ' + username : 'Not signed in'}</h2>
      </header>
      <main>
        <h1>Landing Page</h1>
        {username ? <PasskeyList username={username} /> : "Sign in to manage passkeys"}
      </main>
    </div>
  );
}

export default App;