from django.db import models


class Issue(models.Model):
    error_code = models.CharField(max_length=50)  # e.g. DB_CONNECTION_FAIL
    description = models.TextField()
    component = models.CharField(max_length=100, default="unknown")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.error_code} ({self.component}) @ {self.timestamp}"
