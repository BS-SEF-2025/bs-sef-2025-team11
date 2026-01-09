from django.contrib.auth.models import User
from django.db import models

# Existing Profile Model
class Profile(models.Model):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("infrastructure", "Infrastructure"),
        ("lecturer", "Lecturer"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

# --- NEW MODELS FOR US11 ---

class Fault(models.Model):
    """US 11.1: Represents a system error or fault."""
    error_code = models.CharField(max_length=50)  # e.g., 'DB_CONNECTION_FAIL'
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Fault: {self.error_code} at {self.timestamp}"

class Overload(models.Model):
    """US 11.2: Represents high resource usage (CPU/RAM)."""
    component_name = models.CharField(max_length=100) # e.g., 'Core Server CPU'
    load_percentage = models.FloatField()             # e.g., 98.5
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Overload: {self.component_name} ({self.load_percentage}%)"