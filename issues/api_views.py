from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from .services import detect_recurring_patterns


class RecurringPatternViewSet(ViewSet):
    def list(self, request):
        result = detect_recurring_patterns([])
        return Response(result)
