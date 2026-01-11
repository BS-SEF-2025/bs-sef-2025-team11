from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

class LibraryOccupancyTests(TestCase):
    def test_library_requires_login(self):
        url = reverse("infrastructure:library_occupancy")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 302)
        self.assertIn("/accounts/login/", resp["Location"])
        self.assertIn("next=", resp["Location"])

    def test_library_page_loads_for_logged_in_user(self):
        user = User.objects.create_user(username="u1", password="pass12345")
        self.client.login(username="u1", password="pass12345")

        url = reverse("infrastructure:library_occupancy")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, "infrastructure/library_occupancy.html")

        # Context checks
        self.assertIn("capacity", resp.context)
        self.assertIn("current", resp.context)
        self.assertIn("percent", resp.context)
        self.assertIn("level", resp.context)

        percent = resp.context["percent"]
        level = resp.context["level"]

        self.assertTrue(0 <= percent <= 100)
        self.assertIn(level, ["LOW", "MEDIUM", "HIGH"])
