from django.views.decorators.csrf import csrf_exempt
import json

def get_all_issues(request):
    # משיכת כל התקלות מהמסד
    from .models import Issue
    issues = list(Issue.objects.all().values('id', 'lab__name', 'description', 'reported_at', 'is_fixed'))
    return JsonResponse(issues, safe=False)

@csrf_exempt
def update_issue_status(request, issue_id):
    if request.method == 'POST':
        from .models import Issue
        issue = Issue.objects.get(id=issue_id)
        # הפיכת הסטטוס (מתיקון ללא תוקן ולהיפך)
        issue.is_fixed = not issue.is_fixed
        issue.save()
        return JsonResponse({'status': 'success', 'is_fixed': issue.is_fixed})