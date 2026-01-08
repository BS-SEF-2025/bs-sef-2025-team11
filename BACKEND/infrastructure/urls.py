from django.urls import path
from . import views

urlpatterns = [
    path('api/labs/', views.available_labs, name='available-labs'),
]