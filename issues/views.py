from django.shortcuts import render
from django.views.decorators.http import require_GET

from .utils import detect_recurring_faults, detect_recurring_overloads


@require_GET
def recurring_report(request):
    minutes = int(request.GET.get("minutes", 60))
    fault_threshold = int(request.GET.get("fault_threshold", 3))
    cpu_threshold = float(request.GET.get("cpu_threshold", 80.0))

    faults = detect_recurring_faults(minutes_window=minutes, threshold=fault_threshold)
    overloads = detect_recurring_overloads(minutes_window=minutes, cpu_threshold=cpu_threshold)

    context = {
        "minutes": minutes,
        "fault_threshold": fault_threshold,
        "cpu_threshold": cpu_threshold,
        "faults": faults,
        "overloads": overloads,
    }
    return render(request, "issues/recurring_report.html", context)
