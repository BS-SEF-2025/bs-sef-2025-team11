@echo off
echo Starting Campus Hub...

echo Starting Backend Server...
start "CampusHub Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

echo Starting Frontend Server...
start "CampusHub Frontend" cmd /k "npm run dev"

echo.
echo Servers are launching!
echo Backend will be at: http://127.0.0.1:8000
echo Frontend will be at: http://localhost:5173
echo.
echo Opening default browser in 5 seconds...
timeout /t 5 >nul
start http://localhost:5173
