from django.utils.timezone import now, timedelta
from django.db.models import Avg
from .models import OverloadRecord


def detect_recurring_overload(cpu_threshold=80, minutes=60):
    since = now() - timedelta(minutes=minutes)

    return (
        OverloadRecord.objects
        .filter(timestamp__gte=since)
        .values("component")
        .annotate(avg_cpu=Avg("cpu"))
        .filter(avg_cpu__gte=cpu_threshold)
    )
