from django.test import TestCase
from .models import Space

class SpaceTests(TestCase):
    def test_overload(self):
        space = Space.objects.create(
            name="Library",
            capacity=100,
            current_occupancy=120,
            space_type="Study"
        )
        self.assertTrue(space.is_overloaded)
