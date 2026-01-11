from django.urls import path
from .views import library_occupancy_view

app_name = "infrastructure"

urlpatterns = [
    path("library/", library_occupancy_view, name="library_occupancy"),
]
