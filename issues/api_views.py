from rest_framework.views import APIView
from rest_framework.response import Response

from .services import detect_recurring_faults, detect_recurring_overload


class RecurringFaultsAPIView(APIView):
    def get(self, request):
        minutes = int(request.GET.get("minutes", 60))
        threshold = int(request.GET.get("threshold", 3))
        data = list(detect_recurring_faults(minutes=minutes, threshold=threshold))
        return Response(data)


class RecurringOverloadAPIView(APIView):
    def get(self, request):
        minutes = int(request.GET.get("minutes", 60))
        cpu_threshold = float(request.GET.get("cpu_threshold", 80))
        data = list(detect_recurring_overload(minutes=minutes, cpu_threshold=cpu_threshold))
        return Response(data)
