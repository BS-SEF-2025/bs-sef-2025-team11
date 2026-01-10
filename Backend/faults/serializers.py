from rest_framework import serializers
from .models import Fault, Space

class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = ['id', 'name', 'capacity']

class FaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fault
        fields = ['id', 'space', 'category', 'description', 'severity', 'status', 'created_at']
