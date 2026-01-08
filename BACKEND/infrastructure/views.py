from django.http import JsonResponse
from .models import Lab

def library_status(request):
    # כאן תהיה הלוגיקה של US-1
    return JsonResponse({"status": "Coming soon"})

def available_labs(request):
    labs = list(Lab.objects.filter(is_available=True).values('name', 'location', 'capacity'))
    return JsonResponse(labs, safe=False)