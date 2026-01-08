import re
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Min, Max

from .models import IssueReport, RecurringPattern, IssueType


def normalize_title(title: str) -> str:
    t = (title or "").strip().lower()
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"[^a-z0-9\s\-\_]", "", t)
    return t[:160] if t else "untitled"


def make_pattern_key(issue_type: str, location: str, title_norm: str) -> str:
    return f"{issue_type}:{(location or '').strip().lower()}:{title_norm}"

# issues/services.py

def detect_recurring_patterns(data):
    """
    Temporary stub for User Story 11.
    Will be expanded later.
    """
    return {
        "patterns": [],
        "message": "No recurring patterns detected"
    }
