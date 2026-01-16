@echo off
echo Setting up PostgreSQL database for Campus Navigator...

REM Create database
psql -U postgres -c "CREATE DATABASE campus_navigator;"

REM Create user (optional)
psql -U postgres -c "CREATE USER campus_user WITH PASSWORD 'postgres123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE campus_navigator TO campus_user;"

echo Database setup complete!
echo.
echo Next steps:
echo 1. Run: python manage.py migrate
echo 2. Run: python manage.py loaddata data_backup.json
echo 3. Start the server: python manage.py runserver