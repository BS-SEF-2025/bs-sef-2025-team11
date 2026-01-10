from django.db import models

class Library(models.Model):
    name = models.CharField(max_length=100, default="הספרייה המרכזית")
    current_occupancy = models.IntegerField(default=0)
    max_capacity = models.IntegerField(default=200)
    last_updated = models.DateTimeField(auto_now=True)

    @property
    def occupancy_percentage(self):
        if self.max_capacity <= 0: return 0
        return (self.current_occupancy / self.max_capacity) * 100

    def get_recommendation(self):
        perc = self.occupancy_percentage
        if perc < 50: return "מומלץ להגיע! יש הרבה מקום."
        if perc < 85: return "יש מקום, אך הספרייה מתמלאת."
        return "עמוס מאוד, מומלץ לחכות או לחפש מקום אחר."
class Lab(models.Model):
    name = models.CharField(max_length=100)
    available_computers = models.IntegerField()
    total_computers = models.IntegerField()

    def __str__(self):
        return self.name