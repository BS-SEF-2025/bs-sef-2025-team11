from django.test import TestCase
from .models import Fault
from .services import detect_recurring_faults

from infrastructure.models import OverloadRecord
from .services import detect_recurring_overload


class RecurringPatternsTests(TestCase):

    def test_detects_recurring_faults(self):
        for _ in range(3):
            Fault.objects.create(
                error_code="DB_FAIL",
                description="connection error",
                component="Database",
            )

        result = list(detect_recurring_faults(minutes=60, threshold=3))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["error_code"], "DB_FAIL")
        self.assertEqual(result[0]["component"], "Database")

    def test_detects_recurring_overload(self):
        OverloadRecord.objects.create(component="Server-1", cpu=90, memory=50)
        OverloadRecord.objects.create(component="Server-1", cpu=85, memory=55)

        result = list(detect_recurring_overload(minutes=60, cpu_threshold=80))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["component"], "Server-1")
