from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # הדרך הפשוטה והנכונה להגדיר את האדמין
    path('admin/', admin.site.urls),
    # חיבור הכתובות של האפליקציה שלך
    path('infrastructure/', include('infrastructure.urls')),
]