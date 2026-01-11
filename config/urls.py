from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path("admin/", admin.site.urls),

    # HOME -> /library/
    path("", RedirectView.as_view(url="/library/", permanent=False)),

    # Auth (login/logout/password views)
    path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/", include(("accounts.urls", "accounts"), namespace="accounts")),

    # Apps
    path("", include(("infrastructure.urls", "infrastructure"), namespace="infrastructure")),  # /library/
    path("room_requests/", include(("room_requests.urls", "room_requests"), namespace="room_requests")),
]
