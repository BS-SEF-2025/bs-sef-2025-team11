from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path("auth/register", views.register, name="register"),
    path("auth/login", views.login, name="login"),
    path("auth/me", views.me, name="me"),
    path("auth/set-role", views.set_role, name="set_role"),
    
    # Library endpoints
    path("libraries/list", views.list_libraries, name="list_libraries"),
    path("library/status", views.library_status, name="library_status"),
    path("library/create", views.create_library, name="create_library"),
    path("library/update", views.library_update, name="library_update"),
    
    # Lab endpoints
    path("labs/list", views.list_labs, name="list_labs"),
    path("labs/create", views.create_lab, name="create_lab"),
    path("labs/<int:lab_id>/update", views.update_lab, name="update_lab"),
    
    # Classroom endpoints
    path("classrooms/list", views.list_classrooms, name="list_classrooms"),
    path("classrooms/create", views.create_classroom, name="create_classroom"),
    path("classrooms/<int:classroom_id>/update", views.update_classroom, name="update_classroom"),
    
    # Update request endpoints
    path("updates/pending", views.list_pending_updates, name="list_pending_updates"),
    path("updates/library/<int:request_id>/approve", views.approve_library_update, name="approve_library_update"),
    path("updates/library/<int:request_id>/reject", views.reject_library_update, name="reject_library_update"),
    path("updates/lab/<int:request_id>/approve", views.approve_lab_update, name="approve_lab_update"),
    path("updates/lab/<int:request_id>/reject", views.reject_lab_update, name="reject_lab_update"),
    
    # Room request endpoints
    path("room-requests/create", views.create_room_request, name="create_room_request"),
    path("room-requests/list", views.list_room_requests, name="list_room_requests"),
    path("room-requests/<int:request_id>/approve", views.approve_room_request, name="approve_room_request"),
    path("room-requests/<int:request_id>/reject", views.reject_room_request, name="reject_room_request"),
    
    # Fault report endpoints
    path("faults/create", views.create_fault, name="create_fault"),
    path("faults/list", views.list_faults, name="list_faults"),
    path("faults/<int:fault_id>/update", views.update_fault, name="update_fault"),
    
    # Admin endpoints
    path("admin/users", views.admin_users, name="admin_users"),
    path("admin/stats", views.admin_stats, name="admin_stats"),
    path("admin/role-requests", views.admin_role_requests, name="admin_role_requests"),
    path("admin/role-requests/<int:request_id>/approve", views.admin_approve_role, name="admin_approve_role"),
    path("admin/role-requests/<int:request_id>/reject", views.admin_reject_role, name="admin_reject_role"),
    
    # Recurring issues (US-11)
    path("reports/recurring", views.get_recurring_issues, name="recurring_issues"),
    path("reports/log-overload", views.log_overload, name="log_overload"),
    
    # Notifications
    path("notifications/list", views.list_notifications, name="list_notifications"),
    path("notifications/<int:notification_id>/read", views.mark_notification_read, name="mark_notification_read"),
    path("notifications/read-all", views.mark_all_notifications_read, name="mark_all_notifications_read"),
    
    # Test endpoints
    path("test", views.test_endpoint, name="test"),
    path("test-auth", views.test_auth, name="test_auth"),
]
