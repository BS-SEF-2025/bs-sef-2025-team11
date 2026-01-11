from django.shortcuts import render
from .models import LibraryOccupancy

def library_occupancy_view(request):
    latest = LibraryOccupancy.objects.order_by("-captured_at").first()
    return render(
        request,
        "infrastructure/library_occupancy.html",
        {"latest": latest}
    )
