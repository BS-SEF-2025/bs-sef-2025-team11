from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse

class RecurringEndpointsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_recurring_faults_endpoint(self):
        url = reverse("recurring_faults")
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)

    def test_recurring_overloads_endpoint(self):
        url = reverse("recurring_overloads")
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
