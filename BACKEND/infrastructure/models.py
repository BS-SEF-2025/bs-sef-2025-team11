from django.db import models

# המודל של החדרים (כבר קיים אצלך)
class Room(models.Model):
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=50)
    capacity = models.IntegerField()

# הוסף את זה עבור US-1:
class LibraryOccupancy(models.Model):
    current_occupancy = models.IntegerField(default=0)  # אחוז עומס
    status_label = models.CharField(max_length=20, default="Low") # Low/Medium/High
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Library: {self.current_occupancy}%"