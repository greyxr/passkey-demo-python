import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import RegistrationButton from './RegistrationButton';
import { useAuth } from './AuthContext';

function Header() {
  const { username, logout } = useAuth();
  const [identifier, setIdentifier] = useState('');

  const handleLogout = () => {
    logout();
    setIdentifier('');
  };

  return (
    <header className="header">
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
          <button className="custom-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <LoginButton className="custom-button" identifier={identifier} />
        )}
        <RegistrationButton className="custom-button" identifier={identifier} />
        <button>Signin with Passkey</button>
        <Link to="/settings">Settings</Link>
      </div>
      <h2>{username ? 'Signed in as ' + username : 'Not signed in'}</h2>
    </header>
  );
}

export default Header;
