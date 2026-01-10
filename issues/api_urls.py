from django.urls import path
from .api_views import RecurringFaultsAPIView, RecurringOverloadAPIView

urlpatterns = [
    path("recurring-faults/", RecurringFaultsAPIView.as_view(), name="recurring-faults"),
    path("recurring-overloads/", RecurringOverloadAPIView.as_view(), name="recurring-overloads"),
]
