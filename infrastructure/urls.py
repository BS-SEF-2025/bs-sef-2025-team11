from django.urls import path
from . import views

app_name = "infrastructure"

urlpatterns = [
    path("library-occupancy/", views.library_occupancy_view, name="library_occupancy"),
]
