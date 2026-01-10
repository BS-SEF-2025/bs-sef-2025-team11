from django.urls import path
from . import views

urlpatterns = [
    path("library/", views.library_status, name="library-status"),
    path("api/libraries/", views.libraries_api, name="libraries_api"),
    path("api/labs/", views.labs_api, name="labs_api"),
    path("api/dashboard/", views.dashboard_api, name="dashboard_api"),
]
