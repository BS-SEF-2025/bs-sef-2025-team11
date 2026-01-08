from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render
from .models import Profile

def login_view(request):
    error = None

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")
        role = request.POST.get("role", "")

        user = authenticate(request, username=username, password=password)

        if user is None:
            error = "Invalid username or password"
        else:
            profile = Profile.objects.filter(user=user).first()

            if not profile:
                error = "Access profile not configured"
            elif profile.role != role:
                error = "Access not allowed for selected role"
            else:
                login(request, user)

                if role == "student":
                    return redirect("student_home")
                if role == "infrastructure":
                    return redirect("infra_home")
                if role == "lecturer":
                    return redirect("lecturer_home")

    return render(request, "auth/login.html", {"error": error})
