from django.test import TestCase
from django.urls import reverse
from .models import LibraryOccupancy


class LibraryOccupancyTests(TestCase):
    def test_page_renders(self):
        LibraryOccupancy.objects.create(occupancy_percent=55, source="manual")
        res = self.client.get(reverse("infrastructure:library_occupancy"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "55%")

    def test_value_range(self):
        obj = LibraryOccupancy.objects.create(occupancy_percent=0)
        self.assertTrue(0 <= obj.occupancy_percent <= 100)
