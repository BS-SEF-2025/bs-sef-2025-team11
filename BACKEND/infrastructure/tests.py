from django.test import TestCase
from .models import Lab

class LabTest(TestCase):
    def test_create_lab(self):
        # יצירת מעבדה לבדיקה
        lab = Lab.objects.create(name="Computer Lab A", location="Building 1", capacity=30)
        self.assertEqual(lab.name, "Computer Lab A")
        print("\nTest: Lab created successfully!")

    def test_api_available_labs(self):
        # בדיקה שה-API מחזיר תוצאה תקינה
        Lab.objects.create(name="Lab B", location="Building 2", is_available=True, capacity=20)
        response = self.client.get('/infrastructure/api/labs/')
        self.assertEqual(response.status_code, 200)