from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Frontend pages
    path("issues/", include("issues.urls")),

    # API
    path("api/issues/", include("issues.api_urls")),
]
