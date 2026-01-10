from django.test import TestCase
from .models import Space, UtilizationRecord

class UtilizationTests(TestCase):
    def test_utilization_report(self):
        space = Space.objects.create(name="Hall A", capacity=200)
        report = UtilizationRecord.objects.create(
            space=space, date="2023-10-01", average_occupancy=75.0, peak_occupancy=180
        )
        self.assertEqual(report.peak_occupancy, 180)
        self.assertEqual(str(report), "Hall A - 2023-10-01")
