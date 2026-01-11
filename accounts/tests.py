from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from .models import Profile


class LoginFlowTests(TestCase):
    def setUp(self):
        # Create users
        self.student = User.objects.create_user(username="student_test", password="pass12345")
        Profile.objects.get_or_create(user=self.student, defaults={"role": "student"})

        self.infra = User.objects.create_user(username="infra_test", password="pass12345")
        Profile.objects.get_or_create(user=self.infra, defaults={"role": "infrastructure"})

    def test_login_page_loads(self):
        resp = self.client.get("/login/")
        self.assertEqual(resp.status_code, 200)

    def test_login_wrong_password(self):
        resp = self.client.post("/login/", {"username": "student_test", "password": "wrong", "role": "student"})
        self.assertContains(resp, "Invalid username or password", status_code=200)

    def test_login_wrong_role(self):
        resp = self.client.post("/login/", {"username": "student_test", "password": "pass12345", "role": "infrastructure"})
        self.assertContains(resp, "Access not allowed for selected role", status_code=200)

    def test_login_success_redirects_to_role_home(self):
        resp = self.client.post("/login/", {"username": "student_test", "password": "pass12345", "role": "student"})
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp.url.endswith("/student/"))

    def test_logout_redirects_to_login(self):
        self.client.post("/login/", {"username": "student_test", "password": "pass12345", "role": "student"})
        resp = self.client.get("/logout/")
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp.url.endswith("/login/"))
