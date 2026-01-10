from django.contrib import admin
from .models import Space, UtilizationRecord

@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity')

@admin.register(UtilizationRecord)
class UtilizationRecordAdmin(admin.ModelAdmin):
    list_display = ('space', 'date', 'average_occupancy', 'peak_occupancy')
    list_filter = ('space', 'date')
