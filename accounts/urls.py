from django.urls import path
from .views import login_view, logout_view, student_home, infra_home, lecturer_home

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),

    # Role dashboards
    path("student/", student_home, name="student_home"),
    path("infrastructure/", infra_home, name="infra_home"),
    path("lecturer/", lecturer_home, name="lecturer_home"),
]
