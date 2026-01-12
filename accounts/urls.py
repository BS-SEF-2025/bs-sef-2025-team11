from django.urls import path
from . import views

urlpatterns = [
    # Ensure name='login' is exactly like this
    path('login/', views.login_view, name='login'), 
    path('logout/', views.logout_view, name='logout'),
]
