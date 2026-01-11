from rest_framework import serializers
from .models import Fault, Overload

class FaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fault
        fields = "__all__"

class OverloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Overload
        fields = "__all__"
