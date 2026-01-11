from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/issues/", include("issues.api_urls")),
    # and if you have html pages:
    path("issues/", include("issues.urls")),
]
