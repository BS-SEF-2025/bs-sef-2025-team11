from django.db import models

# המודל של המעבדות (עבור US2)
class Lab(models.Model):
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100)
    floor = models.IntegerField()
    capacity = models.IntegerField()
    current_students = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# המודל של ההתראות (עבור US5 - זה מה שחסר לך!)
class Alert(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title