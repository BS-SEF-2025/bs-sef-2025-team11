from django.urls import path
from . import views

app_name = "issues"

urlpatterns = [
    path("recurring-report/", views.recurring_report, name="recurring_report"),
]
