from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FaultViewSet, SpaceViewSet

router = DefaultRouter()
router.register(r'faults', FaultViewSet)
router.register(r'spaces', SpaceViewSet)

urlpatterns = [
    path('', include(router.urls)),

]
