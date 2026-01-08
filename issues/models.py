

# Create your models here.
from django.db import models
from django.contrib.auth.models import User


class IssueType(models.TextChoices):
    FAULT = "FAULT", "Fault"
    OVERLOAD = "OVERLOAD", "Overload"


class Severity(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    CRITICAL = "CRITICAL", "Critical"


class IssueReport(models.Model):
    """
    A single reported infrastructure issue event.
    Used as input for recurring pattern detection.
    """
    issue_type = models.CharField(max_length=20, choices=IssueType.choices)
    location = models.CharField(max_length=120)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MEDIUM)

    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.issue_type}] {self.location} - {self.title}"


class RecurringPattern(models.Model):
    """
    Computed recurring pattern detected from IssueReports.
    """
    issue_type = models.CharField(max_length=20, choices=IssueType.choices)
    pattern_key = models.CharField(max_length=220, unique=True)  # deterministic key
    location = models.CharField(max_length=120)
    title_norm = models.CharField(max_length=160)

    window_days = models.PositiveIntegerField(default=7)
    threshold = models.PositiveIntegerField(default=3)
    count_in_window = models.PositiveIntegerField(default=0)

    first_seen = models.DateTimeField(null=True, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    last_computed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pattern({self.issue_type}) {self.location} {self.title_norm} x{self.count_in_window}"
