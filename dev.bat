@echo off

REM Build the frontend
echo Building frontend...
cd frontend
call npm run build
cd ..

REM Install Python dependencies if needed
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

REM Start the Flask server
echo Starting Flask server...
cd backend
python app.py
