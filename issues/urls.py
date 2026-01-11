from django.urls import path
from . import views

urlpatterns = [
    path("recurring-report/", views.recurring_report, name="recurring_report"),
]
