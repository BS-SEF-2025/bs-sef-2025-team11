from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # HTML pages
    path("issues/", include("issues.urls")),

    # API endpoints
    path("api/issues/", include("issues.api_urls")),
]
