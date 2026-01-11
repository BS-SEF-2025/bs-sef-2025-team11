from django.db import models


class Fault(models.Model):
    """
    Represents a system fault/error event.
    """
    error_code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.error_code} @ {self.timestamp}"


class Overload(models.Model):
    """
    Represents high resource usage events (CPU/RAM etc.).
    """
    component_name = models.CharField(max_length=100)
    cpu_percent = models.FloatField(default=0.0)
    ram_percent = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.component_name} CPU:{self.cpu_percent}% RAM:{self.ram_percent}% @ {self.timestamp}"
