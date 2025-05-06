import React, { useState } from 'react';
import './App.css';
import LoginButton from './LoginButton';
import RegistrationButton from './RegistrationButton';
import PasskeyList from './PasskeyList';

function App() {
  const [username, setUsername] = useState(false);
  const [identifier, setIdentifier] = useState('');

  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          backgroundColor: '#282c34',
          color: 'white',
          borderBottom: '1px solid white',
        }}
      >
        <h1>JS Passkey Demo</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={identifier}
            placeholder="username"
            onChange={(e) => setIdentifier(e.target.value)}
            className="search-input"
            style={{
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '50%', // Adjusted to make the input half the size
            }}
          />
          {username ? (
            <button className="custom-button" onClick={() => setUsername(false)}>
              Logout
            </button>
          ) : (
            <LoginButton className="custom-button" identifier={identifier} setUsername={setUsername} />
          )}
          <RegistrationButton className="custom-button" identifier={identifier} setUsername={setUsername} />
        </div>
        <h2 style={{ margin: 0 }}>{username ? 'Signed in as ' + username : 'Not signed in'}</h2>
      </header>
      <main style={{ padding: '20px', color: 'white' }}>
        <h1>Landing Page</h1>
        {username ? <PasskeyList username={username} /> : "Sign in to manage passkeys"}
      </main>
    </div>
  );
}

export default App;