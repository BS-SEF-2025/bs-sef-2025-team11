from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.shortcuts import redirect, render
from .models import Profile


def login_view(request):
    error = None

    if request.user.is_authenticated:
        # If already logged in, send user to their role home
        profile = Profile.objects.filter(user=request.user).first()
        if profile:
            return redirect(_role_to_home_url_name(profile.role))
        return redirect("login")

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
                return redirect(_role_to_home_url_name(role))

    return render(request, "auth/login.html", {"error": error})


def logout_view(request):
    logout(request)
    return redirect("login")


def _role_to_home_url_name(role: str) -> str:
    if role == "student":
        return "student_home"
    if role == "infrastructure":
        return "infra_home"
    if role == "lecturer":
        return "lecturer_home"
    return "login"


def _require_role(request, required_role: str):
    profile = Profile.objects.filter(user=request.user).first()
    if not profile or profile.role != required_role:
        return False
    return True


@login_required
def student_home(request):
    if not _require_role(request, "student"):
        return HttpResponseForbidden("Forbidden: Student access only")
    return render(request, "auth/student_home.html")


@login_required
def infra_home(request):
    if not _require_role(request, "infrastructure"):
        return HttpResponseForbidden("Forbidden: Infrastructure access only")
    return render(request, "auth/infra_home.html")


@login_required
def lecturer_home(request):
    if not _require_role(request, "lecturer"):
        return HttpResponseForbidden("Forbidden: Lecturer access only")
    return render(request, "auth/lecturer_home.html")
