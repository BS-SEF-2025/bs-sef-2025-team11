from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def library_occupancy_view(request):
    capacity = 200
    current = 140

    percent = int((current / capacity) * 100) if capacity else 0

    if percent <= 40:
        level = "LOW"
    elif percent <= 70:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return render(request, "infrastructure/library_occupancy.html", {
        "capacity": capacity,
        "current": current,
        "percent": percent,
        "level": level,
    })
