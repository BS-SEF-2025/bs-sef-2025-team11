from rest_framework import serializers
from .models import Space

class SpaceSerializer(serializers.ModelSerializer):
    is_overloaded = serializers.ReadOnlyField()
    load_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Space
        fields = '__all__'
