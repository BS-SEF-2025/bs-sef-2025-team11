from django.db import models
from django.core.validators import MinValueValidator

class Space(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    current_occupancy = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    space_type = models.CharField(max_length=50)

    @property
    def is_overloaded(self):
        return self.current_occupancy > self.capacity

    @property
    def load_percentage(self):
        return int((self.current_occupancy / self.capacity) * 100)

    def __str__(self):
        return self.name
