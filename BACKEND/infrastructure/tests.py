from django.test import TestCase
from django.urls import reverse
from .models import Lab, Issue

class MaintenanceDashboardTests(TestCase):
    def setUp(self):
        # יצירת נתונים בסיסיים שדרושים לבדיקה של US7
        self.lab = Lab.objects.create(name="Lab 1", location="A1", capacity=20)
        self.issue = Issue.objects.create(
            lab=self.lab, 
            description="Broken Screen", 
            is_fixed=False
        )

    def test_get_all_issues_api(self):
        """US7: בדיקה שה-API מחזיר את רשימת התקלות לצוות התחזוקה"""
        response = self.client.get('/infrastructure/api/issues/')
        self.assertEqual(response.status_code, 200)
        # בדיקה שהתקלה שיצרנו מופיעה בתוצאות
        self.assertContains(response, "Broken Screen")

    def test_toggle_issue_status(self):
        """US7: בדיקה שלחיצה על הכפתור בלוח הבקרה משנה את סטטוס התקלה"""
        # שליחת בקשת עדכון
        url = reverse('update-issue', args=[self.issue.id])
        response = self.client.post(url)
        
        # רענון הנתון מהדאטה-בייס
        self.issue.refresh_from_db()
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.issue.is_fixed) # מוודא שהפך ל-True