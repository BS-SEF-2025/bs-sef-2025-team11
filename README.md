# 🏛️ Campus Infrastructure Hub (CIH)
> **מערכת חכמה לניהול וניטור משאבי קמפוס בזמן אמת**

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)

מערכת ה-CIH נועדה לשפר את חווית הסטודנט בקמפוס על ידי הנגשת נתונים חיים על עומסים בתשתיות השונות (ספריות, מעבדות, קפיטריות).

---

## 🎯 User Story #1: ניטור עומס ספריות (סטטוס: ✅ הושלם)

**הצורך:** סטודנטים מבזבזים זמן בהגעה לספרייה רק כדי לגלות שאין מקום פנוי.  
**הפתרון:** דשבורד דינמי המציג רמת עומס והמלצה אוטומטית.

### 🛠️ יכולות המערכת ב-US1:
* **API חכם:** חישוב אחוזי תפוסה בזמן אמת ב-Backend.
* **מנגנון המלצות:** אלגוריתם המייצר הודעה (Safe/Busy) על בסיס נתוני עומס.
* **UI דינמי:** שינוי צבעי ממשק (ירוק 🟢, כתום 🟠, אדום 🔴) בהתאם למצב התפוסה.
* **Live Updates:** סנכרון אוטומטי מול בסיס הנתונים ללא צורך ברענון דף (כל 5 שניות).

---

## 🏗️ ארכיטקטורת המערכת



### רכיבים מרכזיים:
1.  **Frontend (React):** משתמש ב-Axios לצריכת הנתונים וניהול State של רמת העומס.
2.  **Backend (Django):** מספק נקודת קצה (Endpoint) ב-JSON הכוללת חישובים לוגיים.
3.  **Admin Panel:** ממשק ניהול מאובטח המאפשר למנהלי תשתיות לעדכן נתונים בשטח.

---

## 💻 התקנה והרצה

### שלב 1: Backend
```bash
cd BACKEND
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
