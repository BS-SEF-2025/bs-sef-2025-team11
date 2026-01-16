#!/bin/bash

echo "🚀 Setting up Campus Navigator..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py create_test_users
echo "✅ Backend setup complete!"

# Frontend setup
echo "📦 Setting up frontend..."
cd ..
npm install
echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Terminal 2: npm run dev"
echo ""
echo "Access at: http://localhost:5173"
