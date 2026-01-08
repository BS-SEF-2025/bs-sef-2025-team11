from django.db import models

class Lab(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    capacity = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.location})"