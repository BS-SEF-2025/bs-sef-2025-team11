from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import LabStatus

User = get_user_model()

class LabStatusTests(TestCase):
    def setUp(self):
        self.client = APIClient()
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
            current_occupancy=50, # Full
            is_available=True
        )
        # Create a manager user
        self.manager = User.objects.create_user(email='manager@test.com', password='password')
        self.manager.profile.role = 'manager'
        self.manager.profile.save()

    def test_list_labs_public(self):
        """Ensure anyone can view lab status"""
        url = reverse('list_labs')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
    def test_create_lab_manager_only(self):
        """Ensure only managers can create labs"""
        url = reverse('create_lab')
        data = {
            'name': 'New Lab',
            'building': 'New Block',
            'room_number': '303',
            'max_capacity': 20
        }
        
        # Unauthenticated
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Authenticated as Manager
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
