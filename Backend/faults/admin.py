from django.contrib import admin
from .models import Space, Fault  # import your models

# Register models so they show up in Django admin
admin.site.register(Space)
admin.site.register(Fault)
