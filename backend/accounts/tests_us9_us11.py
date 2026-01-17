from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Profile, FaultReport, OverloadRecord
import json
from datetime import datetime, timedelta

class AuthenticationFlowTests(TestCase):
    """US-9: Authentication Flow Tests"""
    
    def setUp(self):
        self.client = Client()
        self.email = "student@campus.edu"
        self.password = "securepass123"
        self.user = User.objects.create_user(
            username=self.email, 
            email=self.email, 
            password=self.password,
            first_name="Test",
            last_name="Student"
        )
        self.profile, _ = Profile.objects.get_or_create(user=self.user)
        self.profile.role = 'student'
        self.profile.save()

    def test_login_success(self):
        """Test successful login returns token and user data"""
        response = self.client.post('/api/auth/login',
            data=json.dumps({'email': self.email, 'password': self.password}),
            content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], self.email)
        self.assertEqual(data['user']['role'], 'student')

    def test_login_invalid_password(self):
        """Test login fails with wrong password"""
        response = self.client.post('/api/auth/login',
            data=json.dumps({'email': self.email, 'password': 'wrongpassword'}),
            content_type='application/json')
        
        self.assertEqual(response.status_code, 401)

    def test_protected_route_requires_auth(self):
        """Test that a protected route returns 401 without token"""
        response = self.client.get('/api/auth/me')
        self.assertEqual(response.status_code, 401)

    def test_protected_route_with_valid_token(self):
        """Test that a protected route works with valid token"""
        # Get token from login
        login_res = self.client.post('/api/auth/login',
            data=json.dumps({'email': self.email, 'password': self.password}),
            content_type='application/json')
        token = json.loads(login_res.content)['token']
        
        response = self.client.get('/api/auth/me', 
                                  HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['user']['email'], self.email)

class RecurringPatternTests(TestCase):
    """US-11: Recurring Pattern Detection Tests"""
    
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(username='admin@test.com', email='admin@test.com', password='password123')
        prof, _ = Profile.objects.get_or_create(user=self.admin)
        prof.role = 'admin'
        prof.save()
        
        # Login to get token
        response = self.client.post('/api/auth/login',
            data=json.dumps({'email': 'admin@test.com', 'password': 'password123'}),
            content_type='application/json')
        self.token = json.loads(response.content)['token']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_recurring_fault_detection(self):
        """Test that identical faults are grouped and identified as recurring"""
        # Create 3 identical faults in Science Building Room 101
        for i in range(3):
            FaultReport.objects.create(
                reported_by=self.admin,
                title=f"Fault {i}",
                description="Projector not working",
                building="Science",
                room_number="101",
                category="projector",
                status="open"
            )
        
        # Create a single fault elsewhere
        FaultReport.objects.create(
            reported_by=self.admin,
            title="Other Fault",
            building="Arts",
            room_number="202",
            category="lighting",
            status="open"
        )
        
        response = self.client.get('/api/reports/recurring', **self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # Should find 1 recurring fault pattern (Science 101)
        self.assertEqual(len(data['recurring_faults']), 1)
        self.assertEqual(data['recurring_faults'][0]['building'], "Science")
        self.assertEqual(data['recurring_faults'][0]['count'], 3)

    def test_recurring_overload_detection(self):
        """Test that multiple overloads are identified"""
        # Create 2 overloads for occupancy in Library
        for _ in range(2):
            OverloadRecord.objects.create(
                resource_type="occupancy",
                building="Library",
                room_number="Main",
                current_value=120,
                threshold_value=100
            )
            
        response = self.client.get('/api/reports/recurring', **self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertEqual(len(data['recurring_overloads']), 1)
        self.assertEqual(data['recurring_overloads'][0]['building'], "Library")
        self.assertEqual(data['recurring_overloads'][0]['count'], 2)
