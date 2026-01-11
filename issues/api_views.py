from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Fault, Overload
from .serializers import FaultSerializer, OverloadSerializer


@api_view(["GET"])
def recurring_faults(request):
    qs = Fault.objects.all().order_by("-timestamp")
    return Response(FaultSerializer(qs, many=True).data)


@api_view(["GET"])
def recurring_overloads(request):
    qs = Overload.objects.all().order_by("-timestamp")
    return Response(OverloadSerializer(qs, many=True).data)
