from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth + role dashboards
    path("", include("accounts.urls")),

    # Other HTML pages
    path("issues/", include("issues.urls")),

    # API endpoints
    path("api/issues/", include("issues.api_urls")),
]
