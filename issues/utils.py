from datetime import timedelta
from django.utils import timezone
from django.db.models import Count

from .models import Fault, Overload


def detect_recurring_faults(minutes_window: int = 60, threshold: int = 3):
    """
    Returns list of dicts: error_code + count within last X minutes,
    where count >= threshold.
    """
    since = timezone.now() - timedelta(minutes=minutes_window)

    qs = (
        Fault.objects.filter(timestamp__gte=since)
        .values("error_code")
        .annotate(count=Count("id"))
        .filter(count__gte=threshold)
        .order_by("-count", "error_code")
    )
    return list(qs)


def detect_recurring_overloads(minutes_window: int = 60, cpu_threshold: float = 80.0):
    """
    Returns list of dicts: component_name + count within last X minutes,
    where cpu_percent >= cpu_threshold.
    """
    since = timezone.now() - timedelta(minutes=minutes_window)

    qs = (
        Overload.objects.filter(timestamp__gte=since, cpu_percent__gte=cpu_threshold)
        .values("component_name")
        .annotate(count=Count("id"))
        .order_by("-count", "component_name")
    )
    return list(qs)
