@echo off
cd /d "%~dp0backend"
echo Cleaning up old venv...
if exist venv (
    rmdir /s /q venv
)

echo Creating new venv with Python 3.13...
py -3.13 -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create venv with Python 3.13!
    echo Trying default python...
    python -m venv venv
)

set PYTHON_EXE=venv\Scripts\python.exe
set PIP_EXE=venv\Scripts\pip.exe

if not exist %PYTHON_EXE% (
    echo Python executable not found after creation!
    exit /b 1
)

echo Installing requirements...
"%PIP_EXE%" install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Pip install failed!
    exit /b %ERRORLEVEL%
)

echo Running migrations...
"%PYTHON_EXE%" manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo Migrate failed!
    exit /b %ERRORLEVEL%
)

echo Backend fixed and ready!
