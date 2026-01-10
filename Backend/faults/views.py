from rest_framework import viewsets
from .models import Fault, Space
from .serializers import FaultSerializer, SpaceSerializer

class FaultViewSet(viewsets.ModelViewSet):
    queryset = Fault.objects.all().order_by('-created_at')
    serializer_class = FaultSerializer

class SpaceViewSet(viewsets.ModelViewSet):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer
