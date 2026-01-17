from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Profile, RoleRequest, LibraryStatus, LabStatus, ClassroomStatus,
    LibraryUpdateRequest, LabUpdateRequest, RoomRequest, FaultReport
)


# Inline Profile in User admin
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


# Extend User admin to show Profile
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'get_role', 'date_joined', 'is_active')
    
    def get_role(self, obj):
        try:
            return obj.profile.role
        except Profile.DoesNotExist:
            return 'No profile'
    get_role.short_description = 'Role'


# Re-register User with new admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# Profile admin with better display
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'manager_type', 'created_at')
    list_filter = ('role', 'manager_type')
    search_fields = ('user__username', 'user__email')


# RoleRequest admin
@admin.register(RoleRequest)
class RoleRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'requested_role', 'status', 'created_at')
    list_filter = ('status', 'requested_role')


# Room/Lab status admins
@admin.register(LibraryStatus)
class LibraryStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'current_occupancy', 'max_capacity', 'is_open')
    list_filter = ('is_open',)


@admin.register(LabStatus)
class LabStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'building', 'room_number', 'current_occupancy', 'max_capacity', 'is_available')
    list_filter = ('is_available', 'building')


@admin.register(ClassroomStatus)
class ClassroomStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'building', 'room_number', 'max_capacity', 'is_available')
    list_filter = ('is_available', 'building')


# Request admins
@admin.register(RoomRequest)
class RoomRequestAdmin(admin.ModelAdmin):
    list_display = ('requested_by', 'room_type', 'purpose', 'status', 'requested_date', 'created_at')
    list_filter = ('status', 'room_type')
    search_fields = ('requested_by__username', 'purpose')


@admin.register(FaultReport)
class FaultReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'reported_by', 'location', 'severity', 'status', 'created_at')
    list_filter = ('status', 'severity', 'category')
    search_fields = ('title', 'location', 'reported_by__username')


@admin.register(LibraryUpdateRequest)
class LibraryUpdateRequestAdmin(admin.ModelAdmin):
    list_display = ('library', 'requested_by', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(LabUpdateRequest)
class LabUpdateRequestAdmin(admin.ModelAdmin):
    list_display = ('lab', 'requested_by', 'status', 'created_at')
    list_filter = ('status',)
