from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import LabStatus, ClassroomStatus, LibraryStatus, FaultReport, RoomRequest, Profile
import json


class UserStory2LabTests(TestCase):
    """User Story 2: Find Available Lab"""
    
    def setUp(self):
        self.client = Client()
        self.lab1 = LabStatus.objects.create(
            name="Science Lab",
            building="Science Block",
            room_number="101",
            max_capacity=30,
            current_occupancy=10,
            is_available=True
        )
        self.lab2 = LabStatus.objects.create(
            name="Engineering Lab",
            building="Engineering Block", 
            room_number="202",
            max_capacity=50,
            current_occupancy=50,
            is_available=False
        )
        # Create user and login
        self.user = User.objects.create_user(username='teststudent@test.com', email='teststudent@test.com', password='password123')
        Profile.objects.update_or_create(user=self.user, defaults={'role': 'student'})
        response = self.client.post('/api/auth/login', 
                                    data=json.dumps({'email': 'teststudent@test.com', 'password': 'password123'}),
                                    content_type='application/json')
        self.token = json.loads(response.content).get('token')
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_list_labs_returns_all_labs(self):
        """Test that lab list endpoint returns all labs"""
        response = self.client.get('/api/labs/list', **self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data['labs']), 2)
        
    def test_lab_has_required_fields(self):
        """Test that lab response includes all required fields"""
        response = self.client.get('/api/labs/list', **self.headers)
        data = json.loads(response.content)
        lab = data['labs'][0]
        required_fields = ['id', 'name', 'building', 'room_number', 'max_capacity', 'current_occupancy', 'is_available']
        for field in required_fields:
            self.assertIn(field, lab)

    def test_empty_labs_returns_empty_list(self):
        """Test handling when no labs exist"""
        LabStatus.objects.all().delete()
        response = self.client.get('/api/labs/list', **self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data['labs']), 0)


class UserStory5RoomRequestTests(TestCase):
    """User Story 5: Approve Room Allocation"""
    
    def setUp(self):
        self.client = Client()
        # Create manager user
        self.manager = User.objects.create_user(username='manager@test.com', email='manager@test.com', password='password123')
        Profile.objects.update_or_create(user=self.manager, defaults={'role': 'manager'})
        
        # Create lecturer user
        self.lecturer = User.objects.create_user(username='lecturer@test.com', email='lecturer@test.com', password='password123')
        Profile.objects.update_or_create(user=self.lecturer, defaults={'role': 'lecturer'})
        
        # Create a classroom
        self.classroom = ClassroomStatus.objects.create(
            name="Lecture Hall A",
            building="Main Block",
            room_number="LH1",
            max_capacity=100,
            is_available=True
        )

    def test_create_room_request(self):
        """Test that lecturers can create room requests"""
        # Login as lecturer
        response = self.client.post('/api/auth/login', 
            data=json.dumps({'email': 'lecturer@test.com', 'password': 'password123'}),
            content_type='application/json')
        token = json.loads(response.content).get('token')
        
        # Create room request
        response = self.client.post('/api/room-requests/create',
            data=json.dumps({
                'room_type': 'classroom',
                'purpose': 'Guest Lecture',
                'expected_attendees': 50,
                'requested_date': '2026-02-01',
                'start_time': '10:00',
                'end_time': '12:00'
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertIn(response.status_code, [200, 201])

    def test_room_request_requires_auth(self):
        """Test that creating room request requires authentication"""
        response = self.client.post('/api/room-requests/create',
            data=json.dumps({
                'room_type': 'classroom',
                'purpose': 'Test',
                'expected_attendees': 10,
                'requested_date': '2026-02-01',
                'start_time': '10:00',
                'end_time': '12:00'
            }),
            content_type='application/json')
        self.assertEqual(response.status_code, 401)


class UserStory7FaultReportTests(TestCase):
    """User Story 7: Track and Manage Faults"""
    
    def setUp(self):
        self.client = Client()
        # Create manager
        self.manager = User.objects.create_user(username='manager2@test.com', email='manager2@test.com', password='password123')
        Profile.objects.update_or_create(user=self.manager, defaults={'role': 'manager'})
        
        # Create student
        self.student = User.objects.create_user(username='student@test.com', email='student@test.com', password='password123')
        
        # Login and get token for student
        response = self.client.post('/api/auth/login',
            data=json.dumps({'email': 'student@test.com', 'password': 'password123'}),
            content_type='application/json')
        self.student_token = json.loads(response.content).get('token')
        
        # Login and get token for manager
        response = self.client.post('/api/auth/login',
            data=json.dumps({'email': 'manager2@test.com', 'password': 'password123'}),
            content_type='application/json')
        self.manager_token = json.loads(response.content).get('token')

    def test_create_fault_report(self):
        """Test that users can create fault reports"""
        response = self.client.post('/api/faults/create',
            data=json.dumps({
                'title': 'Broken Projector',
                'description': 'The projector in room 101 is not working',
                'location': 'Science Block Room 101',
                'severity': 'high',
                'category': 'equipment'
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        self.assertIn(response.status_code, [200, 201])

    def test_fault_status_lifecycle(self):
        """Test fault status can be updated through lifecycle"""
        # Create fault
        fault = FaultReport.objects.create(
            reported_by=self.student,
            title='Test Fault',
            description='Test description',
            location='Test Location',
            severity='medium',
            category='other',
            status='open'
        )
        
        # Update to in_progress (as manager)
        response = self.client.post(f'/api/faults/{fault.id}/update',
            data=json.dumps({
                'status': 'in_progress',
                'assigned_to': 'Maintenance Team'
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.manager_token}')
        self.assertEqual(response.status_code, 200)
        
        # Verify update
        fault.refresh_from_db()
        self.assertEqual(fault.status, 'in_progress')


class AuthenticationTests(TestCase):
    """Authentication Tests"""
    
    def setUp(self):
        self.client = Client()

    def test_register_new_user(self):
        """Test user registration"""
        response = self.client.post('/api/auth/register',
            data=json.dumps({
                'email': 'newuser@test.com',
                'password': 'securepassword123'
            }),
            content_type='application/json')
        self.assertIn(response.status_code, [200, 201])
        data = json.loads(response.content)
        self.assertIn('token', data)

    def test_login_user(self):
        """Test user login"""
        # Create user first
        User.objects.create_user(username='logintest@test.com', email='logintest@test.com', password='testpass123')
        
        response = self.client.post('/api/auth/login',
            data=json.dumps({
                'email': 'logintest@test.com',
                'password': 'testpass123'
            }),
            content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('token', data)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post('/api/auth/login',
            data=json.dumps({
                'email': 'nonexistent@test.com',
                'password': 'wrongpassword'
            }),
            content_type='application/json')
        self.assertIn(response.status_code, [400, 401])
