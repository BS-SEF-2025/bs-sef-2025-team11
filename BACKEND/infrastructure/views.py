from django.http import JsonResponse
from .models import Library, Lab


def _lab_current(lab):
    # נסה כמה שמות אפשריים לתפוסה נוכחית
    for field in ["current_occupancy", "current", "occupied"]:
        if hasattr(lab, field):
            val = getattr(lab, field)
            return val if val is not None else 0
    return 0


def _lab_capacity(lab):
    # נסה כמה שמות אפשריים לקיבולת מקסימלית
    for field in ["max_capacity", "capacity", "max_seats", "total_computers", "max_computers"]:
        if hasattr(lab, field):
            val = getattr(lab, field)
            return val if val is not None else 0
    return 0


def library_status(request):
    lib = Library.objects.order_by("id").first()
    if not lib:
        return JsonResponse({"occupancy": 0, "max_capacity": 0, "percentage": 0, "name": ""})

    percentage = (lib.current_occupancy / lib.max_capacity * 100) if lib.max_capacity else 0

    return JsonResponse({
        "occupancy": lib.current_occupancy,
        "max_capacity": lib.max_capacity,
        "percentage": percentage,
        "name": lib.name,
    })


def libraries_api(request):
    libs = []
    for lib in Library.objects.all().order_by("id"):
        percentage = (lib.current_occupancy / lib.max_capacity * 100) if lib.max_capacity else 0
        libs.append({
            "id": lib.id,
            "name": lib.name,
            "current_occupancy": lib.current_occupancy,
            "max_capacity": lib.max_capacity,
            "percentage": percentage,
        })
    return JsonResponse({"libraries": libs})


def labs_api(request):
    labs = []
    for lab in Lab.objects.all().order_by("id"):
        current = _lab_current(lab)
        capacity = _lab_capacity(lab)
        percentage = (current / capacity * 100) if capacity else 0

        labs.append({
            "id": lab.id,
            "name": lab.name,
            "current_occupancy": current,
            "max_capacity": capacity,
            "percentage": percentage,
        })
    return JsonResponse({"labs": labs})


def dashboard_api(request):
    # Libraries
    libraries = []
    for lib in Library.objects.all().order_by("id"):
        pct = (lib.current_occupancy / lib.max_capacity * 100) if lib.max_capacity else 0
        libraries.append({
            "id": lib.id,
            "name": lib.name,
            "current_occupancy": lib.current_occupancy,
            "max_capacity": lib.max_capacity,
            "percentage": pct,
        })

    # Labs
    labs = []
    for lab in Lab.objects.all().order_by("id"):
        current = _lab_current(lab)
        capacity = _lab_capacity(lab)
        pct = (current / capacity * 100) if capacity else 0

        labs.append({
            "id": lab.id,
            "name": lab.name,
            "current_occupancy": current,
            "max_capacity": capacity,
            "percentage": pct,
        })

    return JsonResponse({"libraries": libraries, "labs": labs})
