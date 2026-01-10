from django.contrib import admin
from .models import Library, Lab

# רישום המודלים כדי שיופיעו בלוח הבקרה
admin.site.register(Library)
admin.site.register(Lab)