from django.db import models


class OverloadRecord(models.Model):
    component = models.CharField(max_length=100)
    cpu = models.FloatField()
    memory = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.component} | CPU: {self.cpu}%"
