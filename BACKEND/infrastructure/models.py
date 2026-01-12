from django.db import models

class Lab(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    capacity = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.location})"

class Alert(models.Model):
    ALERT_TYPES = [('INFO', 'Information'), ('WARNING', 'Warning'), ('URGENT', 'Urgent')]
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=10, choices=ALERT_TYPES, default='INFO')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"[{self.alert_type}] {self.title}"

# המודל שחסר לך ל-US7:
class Issue(models.Model):
    lab = models.ForeignKey(Lab, on_delete=models.CASCADE, related_name='issues')
    description = models.TextField()
    reported_at = models.DateTimeField(auto_now_add=True)
    is_fixed = models.BooleanField(default=False)

    def __str__(self):
        return f"Issue at {self.lab.name}: {self.description[:20]}"