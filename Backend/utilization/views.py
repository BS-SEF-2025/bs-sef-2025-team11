from rest_framework import viewsets
from .models import UtilizationRecord
from .serializers import UtilizationRecordSerializer

class UtilizationRecordViewSet(viewsets.ModelViewSet):
    queryset = UtilizationRecord.objects.all().order_by('-date')
    serializer_class = UtilizationRecordSerializer
