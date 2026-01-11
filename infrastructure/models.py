# infrastructure/models.py
from django.db import models
from django.utils import timezone

class LibraryOccupancy(models.Model):
    occupancy_percent = models.PositiveSmallIntegerField()
    source = models.CharField(max_length=100, default="manual")
    captured_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        ordering = ["-captured_at"]

    def __str__(self):
        return f"{self.occupancy_percent}% at {self.captured_at}"
