from django.urls import path
from . import views

urlpatterns = [
    path('api/labs/', views.lab_list, name='lab-list'),
    path('api/alerts/', views.get_alerts, name='alert-list'),
]