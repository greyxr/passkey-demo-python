import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Settings from './Settings.jsx';
import { AuthProvider } from './AuthContext.jsx';
import UserPage from './UserPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/settings" element={<Settings />} />
          <Route path='/user' element={<UserPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);