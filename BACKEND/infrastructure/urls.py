from django.urls import path
from . import views

urlpatterns = [
   path('api/issues/', views.get_all_issues, name='all-issues'),
path('api/issues/update/<int:issue_id>/', views.update_issue_status, name='update-issue'),
]