from django.test import TestCase
from .models import Space, Fault

class FaultTestCase(TestCase):
    def setUp(self):
        self.space = Space.objects.create(name="Lab 1", capacity=30)

    def test_fault_submission(self):
        fault = Fault.objects.create(
            space=self.space,
            category="AC",
            description="Broken",
            severity="high"
        )
        self.assertEqual(Fault.objects.count(), 1)
        self.assertEqual(fault.status, "open")
