from django.db import models

# Create your models here.
from django.db import models

class Room(models.Model):
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=50)
    capacity = models.IntegerField()

    def __str__(self):
        return self.name