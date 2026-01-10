from rest_framework import serializers
from .models import UtilizationRecord

class UtilizationRecordSerializer(serializers.ModelSerializer):
    space_name = serializers.CharField(source='space.name', read_only=True)

    class Meta:
        model = UtilizationRecord
        fields = ['id', 'space', 'space_name', 'date', 'average_occupancy', 'peak_occupancy']
