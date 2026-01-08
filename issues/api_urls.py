from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import IssueReportViewSet, RecurringPatternViewSet

router = DefaultRouter()
router.register(r"issues", IssueReportViewSet, basename="issues")
router.register(r"patterns", RecurringPatternViewSet, basename="patterns")

urlpatterns = [
    path("", include(router.urls)),
]
