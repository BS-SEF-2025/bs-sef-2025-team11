from django.contrib import admin
from .models import Space

@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'space_type', 'current_occupancy', 'capacity', 'is_overloaded')
