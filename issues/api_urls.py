from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import IssueReportViewSet, RecurringPatternViewSet

router = DefaultRouter()
router.register(r"issues", IssueReportViewSet, basename="issues")
router.register(r"patterns", RecurringPatternViewSet, basename="patterns")
# issues/api_urls.py
router.register(r"recurring-patterns", RecurringPatternViewSet, basename="recurring-patterns")

urlpatterns = [
    path("", include(router.urls)),
]
