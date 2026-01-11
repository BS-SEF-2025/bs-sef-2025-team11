from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def student_home(request): return HttpResponse("Student dashboard")
def infra_home(request): return HttpResponse("Infrastructure dashboard")
def lecturer_home(request): return HttpResponse("Lecturer dashboard")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("accounts.urls")),
    path("student/", student_home, name="student_home"),
    path("infrastructure/", infra_home, name="infra_home"),
    path("lecturer/", lecturer_home, name="lecturer_home"),
]
