@echo off
echo 🚀 Starting Z-AI Predictor Demo...

echo.
echo 📋 Step 1: Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🧪 Step 2: Testing API...
cd ..
node test-api.js

echo.
echo 🌐 Step 3: Starting Frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Demo started! 
echo 📊 Backend: http://localhost:3001/health
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul