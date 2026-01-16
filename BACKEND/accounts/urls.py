from django.urls import path
from . import views

urlpatterns = [
    path("auth/register", views.register),
    path("auth/login", views.login),
    path("auth/me", views.me),
    path("auth/set-role", views.set_role),
    path("test", views.test),
    
    # Library endpoints
    path("libraries/list", views.list_libraries),
    path("library/status", views.library_status),
    path("library/create", views.create_library),
    path("library/update", views.library_update),
    
    # Lab endpoints
    path("labs/list", views.list_labs),
    path("labs/create", views.create_lab),
    path("labs/<int:lab_id>/update", views.update_lab),
    
    # Classroom endpoints
    path("classrooms/list", views.list_classrooms),
    path("classrooms/create", views.create_classroom),
    path("classrooms/<int:classroom_id>/update", views.update_classroom),
    
    # Fault endpoints
    path("faults/list", views.list_faults),
    path("faults/<int:fault_id>/update", views.update_fault),
    path("faults/create", views.create_fault),
    
    # Admin endpoints
    path("admin/users", views.admin_users),
    path("admin/role-requests", views.admin_role_requests),
    path("admin/role-requests/<int:request_id>/approve", views.admin_approve_role),
    path("admin/role-requests/<int:request_id>/reject", views.admin_reject_role),
    path("admin/stats", views.admin_stats),
    
    # Update request endpoints (for managers)
    path("updates/pending", views.list_pending_updates),
    path("updates/library/<int:request_id>/approve", views.approve_library_update),
    path("updates/library/<int:request_id>/reject", views.reject_library_update),
    path("updates/lab/<int:request_id>/approve", views.approve_lab_update),
    path("updates/lab/<int:request_id>/reject", views.reject_lab_update),
    
    # Room request endpoints
    path("room-requests/create", views.create_room_request),
    path("room-requests/list", views.list_room_requests),
    path("room-requests/<int:request_id>/approve", views.approve_room_request),
    path("room-requests/<int:request_id>/reject", views.reject_room_request),
]
