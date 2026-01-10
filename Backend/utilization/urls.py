from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UtilizationRecordViewSet

router = DefaultRouter()
router.register(r'utilization', UtilizationRecordViewSet, basename='utilization')

urlpatterns = [
    path('api/', include(router.urls)),
]
