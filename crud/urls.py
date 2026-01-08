from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth (US-9)
    path('', include('accounts.urls')),

    # APIs

    path('api/', include('issues.api_urls')),

    # Infrastructure dashboard (US-11)
    path('', include('issues.urls')),
]
