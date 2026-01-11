from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("room-requests/", include("room_requests.urls")),
    path("infrastructure/", include("infrastructure.urls")),
    path("accounts/", include("accounts.urls")),

]
