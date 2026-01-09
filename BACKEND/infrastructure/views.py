from django.http import JsonResponse
from .models import Lab, Alert

def lab_list(request):
    # מחזיר את רשימת המעבדות
    labs = list(Lab.objects.all().values())
    return JsonResponse(labs, safe=False)

def get_alerts(request):
    # מחזיר את ההתראות הפעילות
    alerts = list(Alert.objects.filter(is_active=True).values())
    return JsonResponse(alerts, safe=False)