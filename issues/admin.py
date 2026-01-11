from django.contrib import admin
from .models import Fault, Overload


@admin.register(Fault)
class FaultAdmin(admin.ModelAdmin):
    list_display = ("id", "error_code", "timestamp")
    search_fields = ("error_code", "description")
    list_filter = ("timestamp",)


@admin.register(Overload)
class OverloadAdmin(admin.ModelAdmin):
    list_display = ("id", "component_name", "cpu_percent", "ram_percent", "timestamp")
    search_fields = ("component_name",)
    list_filter = ("timestamp",)
