from django.shortcuts import render
from .services import detect_recurring_faults, detect_recurring_overload


def recurring_report(request):
    # Optional query params to control thresholds from UI
    minutes = int(request.GET.get("minutes", 60))
    fault_threshold = int(request.GET.get("fault_threshold", 3))
    cpu_threshold = float(request.GET.get("cpu_threshold", 80))

    faults = list(detect_recurring_faults(minutes=minutes, threshold=fault_threshold))
    overloads = list(detect_recurring_overload(minutes=minutes, cpu_threshold=cpu_threshold))

    context = {
        "minutes": minutes,
        "fault_threshold": fault_threshold,
        "cpu_threshold": cpu_threshold,
        "faults": faults,
        "overloads": overloads,
    }
    return render(request, "issues/base.html", context)
