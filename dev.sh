#!/bin/bash

# Build the frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Install Python dependencies if needed
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Start the Flask server
echo "Starting Flask server..."
cd backend
python app.py
