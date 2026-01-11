from django.urls import path
from . import api_views

urlpatterns = [
    path("recurring-faults/", api_views.recurring_faults, name="recurring_faults"),
    path("recurring-overloads/", api_views.recurring_overloads, name="recurring_overloads"),
]
