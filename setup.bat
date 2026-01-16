@echo off
echo 🚀 Setting up Campus Navigator...

REM Backend setup
echo 📦 Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py create_test_users
echo ✅ Backend setup complete!

REM Frontend setup
echo 📦 Setting up frontend...
cd ..
call npm install
echo ✅ Frontend setup complete!

echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Terminal 1: cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo 2. Terminal 2: npm run dev
echo.
echo Access at: http://localhost:5173
pause
