import React from 'react';
import './App.css';
import PasskeyList from './PasskeyList';
import Header from './Header';
import { useAuth } from './AuthContext';

function UserPage() {
  const { username } = useAuth();

  return (
    <div className="container">
      <Header />
      <main>
        <h1>User Page</h1>
        {username ? <PasskeyList username={username} /> : "Sign in to manage passkeys"}
      </main>
    </div>
  );
}

export default UserPage;