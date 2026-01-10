# users/tests.py
from django.test import TestCase
from .models import User

class UserRoleTests(TestCase):
    def test_user_roles(self):
        user = User.objects.create_user(username="manager_user", password="pass123", role="manager")
        self.assertEqual(user.role, "manager")
