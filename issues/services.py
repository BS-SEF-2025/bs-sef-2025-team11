from django.utils.timezone import now, timedelta
from django.db.models import Count, Avg

from .models import Issue
from infrastructure.models import OverloadRecord


def detect_recurring_faults(minutes=60, threshold=3):
    since = now() - timedelta(minutes=minutes)

    return (
        Issue.objects
        .filter(timestamp__gte=since)
        .values("error_code", "component")
        .annotate(count=Count("id"))
        .filter(count__gte=threshold)
        .order_by("-count")
    )


def detect_recurring_overload(cpu_threshold=80, minutes=60):
    since = now() - timedelta(minutes=minutes)

    return (
        OverloadRecord.objects
        .filter(timestamp__gte=since)
        .values("component")
        .annotate(avg_cpu=Avg("cpu"))
        .filter(avg_cpu__gte=cpu_threshold)
        .order_by("-avg_cpu")
    )
