# Passkey Demo Site

This project implements basic passkey functionality using the `webauthn` Python library. The frontend is built in React and the backend serves files with Flask.

## Features

- **Shared Header**: Consistent header across all pages with authentication controls
- **Client-side Routing**: Proper SPA routing with React Router
- **Server-side Support**: Flask backend configured to handle client-side routing
- **Authentication State Management**: Centralized auth state using React Context

## Quick Start

### Option 1: Using the development script (Recommended)

**Windows:**
```bash
dev.bat
```

**Linux/Mac:**
```bash
chmod +x dev.sh
./dev.sh
```

### Option 2: Manual setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Build the frontend:
```bash
npm run build
```

3. Install Python dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Start the server:
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Project Structure

- `frontend/` - React application with shared header component
- `backend/` - Flask server with passkey authentication endpoints
- `frontend/src/Header.jsx` - Shared header component used across all pages
- `frontend/src/AuthContext.jsx` - Authentication state management

## Routing

The application now properly handles:
- Direct URL access (e.g., `http://localhost:5000/settings`)
- Page refreshes on any route
- Client-side navigation between pages
- Static file serving for assets