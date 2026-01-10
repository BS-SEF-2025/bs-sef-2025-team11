from django.test import TestCase
from .models import Library

class LibraryModelTest(TestCase):
    def setUp(self):
        # יצירת נתונים לבדיקה
        Library.objects.create(name="Test Lib", current_occupancy=10, max_capacity=100)

    def test_occupancy_percentage(self):
        lib = Library.objects.get(name="Test Lib")
        # בדיקה שהחישוב של 10/100 הוא אכן 10%
        self.assertEqual(lib.occupancy_percentage, 10.0)

    def test_recommendation_logic(self):
        lib = Library.objects.get(name="Test Lib")
        # בדיקה שבתפוסה נמוכה ההמלצה חיובית
        self.assertIn("מומלץ", lib.get_recommendation()) 