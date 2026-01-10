from django.db import models

class Space(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.IntegerField()

    def __str__(self):
        return self.name

class UtilizationRecord(models.Model):
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    date = models.DateField()
    average_occupancy = models.FloatField()
    peak_occupancy = models.IntegerField()

    def __str__(self):
        return f"{self.space.name} - {self.date}"
