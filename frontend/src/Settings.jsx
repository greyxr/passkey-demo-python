import React from "react";
import Header from './Header';

export default function Settings() {
  return (
    <div className="container">
      <Header />
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <p>Here you can update your account settings.</p>
        {/* Add your settings form or options here */}
      </main>
    </div>
  );
}