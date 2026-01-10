from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User

    # Fields when editing an existing user
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )

    # Fields when adding a new user
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )

    # Columns to display in the user list
    list_display = ['username', 'email', 'role', 'is_staff', 'is_superuser']

# Register your custom User admin
admin.site.register(User, CustomUserAdmin)

