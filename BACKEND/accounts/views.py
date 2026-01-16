import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt

from .models import Profile, LibraryStatus, LabStatus, FaultReport, RoleRequest, ClassroomStatus, LibraryUpdateRequest, LabUpdateRequest, RoomRequest
from .jwt import create_token, decode_token
from django.utils import timezone
from datetime import datetime, date, time


def _get_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return {}


def _get_bearer_token(request):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


def _auth_user(request):
    token = _get_bearer_token(request)
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id = payload.get("user_id")
        return User.objects.filter(id=user_id).first()
    except Exception:
        return None


def _user_to_dict(user):
    prof, _ = Profile.objects.get_or_create(user=user)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": prof.role,
        "department": prof.department,
        "manager_type": prof.manager_type,
    }


@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    body = _get_body(request)
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return JsonResponse({"message": "Email and password are required"}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({"message": "User already exists"}, status=400)

    user = User.objects.create_user(username=email, email=email, password=password)
    Profile.objects.get_or_create(user=user)

    token = create_token(user)
    return JsonResponse({"token": token, "user": _user_to_dict(user)}, status=201)


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        body = _get_body(request)
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not email or not password:
            return JsonResponse({"message": "Email and password are required"}, status=400)

        user = authenticate(username=email, password=password)
        if not user:
            return JsonResponse({"message": "Invalid credentials"}, status=401)

        Profile.objects.get_or_create(user=user)

        token = create_token(user)
        return JsonResponse({"token": token, "user": _user_to_dict(user)})
    except Exception as e:
        import traceback
        print(f"Login error: {e}")
        print(traceback.format_exc())
        return JsonResponse({"message": f"Server error: {str(e)}"}, status=500)


def me(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    return JsonResponse({"user": _user_to_dict(user)})


@csrf_exempt
def test(request):
    """Simple test endpoint to verify the API is working"""
    return JsonResponse({"message": "API is working!", "method": request.method})


@csrf_exempt
def set_role(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    body = _get_body(request)
    role = (body.get("role") or "").strip().lower()
    manager_type = body.get("manager_type", "").strip() or None
    reason = body.get("reason", "").strip() or None

    if role not in ["student", "lecturer", "manager"]:
        return JsonResponse({"message": "Invalid role"}, status=400)

    prof, _ = Profile.objects.get_or_create(user=user)
    
    # Prevent changing admin role
    if prof.role == "admin":
        return JsonResponse({
            "user": _user_to_dict(user),
            "pending_request": False,
            "message": "Admin role cannot be changed"
        })
    
    # If student, set immediately. If lecturer/manager, create a role request
    if role == "student":
        prof.role = role
        prof.save()
        return JsonResponse({"user": _user_to_dict(user), "pending_request": False})
    else:
        # Check if there's already a pending request
        existing_request = RoleRequest.objects.filter(
            user=user, 
            requested_role=role, 
            status="pending"
        ).first()
        
        if existing_request:
            return JsonResponse({
                "user": _user_to_dict(user),
                "pending_request": True,
                "message": "You already have a pending request for this role"
            })
        
        # Create role request
        role_request = RoleRequest.objects.create(
            user=user,
            requested_role=role,
            manager_type=manager_type if role == "manager" else None,
            reason=reason,
            status="pending"
        )
        
        # Temporarily set role to student so they can use the system
        prof.role = "student"
        prof.save()
        
        return JsonResponse({
            "user": _user_to_dict(user),
            "pending_request": True,
            "request_id": role_request.id,
            "message": f"Your request to become a {role} is pending admin approval. You can use the system as a student for now."
        })


# Library Status endpoints
def library_status(request):
    if request.method == "GET":
        status, _ = LibraryStatus.objects.get_or_create(name="Main Library")
        return JsonResponse({
            "name": status.name,
            "current_occupancy": status.current_occupancy,
            "max_capacity": status.max_capacity,
            "is_open": status.is_open,
            "last_updated": status.last_updated.isoformat(),
        })
    elif request.method == "POST":
        user = _auth_user(request)
        if not user:
            return JsonResponse({"message": "Unauthorized"}, status=401)
        
        body = _get_body(request)
        status, _ = LibraryStatus.objects.get_or_create(name="Main Library")
        status.current_occupancy = body.get("current_occupancy", status.current_occupancy)
        status.max_capacity = body.get("max_capacity", status.max_capacity)
        status.is_open = body.get("is_open", status.is_open)
        status.updated_by = user
        status.save()
        
        return JsonResponse({
            "name": status.name,
            "current_occupancy": status.current_occupancy,
            "max_capacity": status.max_capacity,
            "is_open": status.is_open,
            "last_updated": status.last_updated.isoformat(),
        })
    return JsonResponse({"message": "Method not allowed"}, status=405)


# Lab Status endpoints
def lab_status_list(request):
    if request.method == "GET":
        labs = LabStatus.objects.all()
        return JsonResponse({
            "labs": [{
                "id": lab.id,
                "name": lab.name,
                "building": lab.building,
                "room_number": lab.room_number,
                "current_occupancy": lab.current_occupancy,
                "max_capacity": lab.max_capacity,
                "is_available": lab.is_available,
                "equipment_status": lab.equipment_status,
            } for lab in labs]
        })
    return JsonResponse({"message": "Method not allowed"}, status=405)


# Fault Report endpoints
def fault_reports(request):
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    
    if request.method == "GET":
        # Students and lecturers see only their reports, managers and admins see all
        if prof.role in ["manager", "admin"]:
            reports = FaultReport.objects.all().order_by("-created_at")
        else:
            reports = FaultReport.objects.filter(reporter=user).order_by("-created_at")
        
        return JsonResponse({
            "reports": [{
                "id": report.id,
                "title": report.title,
                "description": report.description,
                "location_type": report.location_type,
                "building": report.building,
                "room_number": report.room_number,
                "category": report.category,
                "severity": report.severity,
                "status": report.status,
                "assigned_to": report.assigned_to,
                "resolution_notes": report.resolution_notes,
                "created_at": report.created_at.isoformat(),
                "updated_at": report.updated_at.isoformat(),
                "reporter_email": report.reporter.email,
            } for report in reports]
        })
    
    elif request.method == "POST":
        body = _get_body(request)
        report = FaultReport.objects.create(
            reporter=user,
            title=body.get("title", ""),
            description=body.get("description", ""),
            location_type=body.get("location_type", ""),
            building=body.get("building", ""),
            room_number=body.get("room_number", ""),
            category=body.get("category", "other"),
            severity=body.get("severity", "medium"),
        )
        
        return JsonResponse({
            "id": report.id,
            "title": report.title,
            "status": report.status,
            "message": "Fault report created successfully"
        }, status=201)
    
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def fault_report_detail(request, report_id):
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    try:
        report = FaultReport.objects.get(id=report_id)
    except FaultReport.DoesNotExist:
        return JsonResponse({"message": "Report not found"}, status=404)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    
    # Only allow managers/admins to update, or the reporter to view
    if prof.role not in ["manager", "admin"] and report.reporter != user:
        return JsonResponse({"message": "Forbidden"}, status=403)
    
    if request.method == "PATCH":
        body = _get_body(request)
        if "status" in body:
            report.status = body["status"]
            if body["status"] in ["resolved", "done", "closed"]:
                report.resolved_at = timezone.now()
        if "assigned_to" in body:
            report.assigned_to = body["assigned_to"]
        if "resolution_notes" in body:
            report.resolution_notes = body["resolution_notes"]
        report.save()
        
        return JsonResponse({
            "id": report.id,
            "status": report.status,
            "message": "Report updated successfully"
        })
    
    return JsonResponse({
        "id": report.id,
        "title": report.title,
        "description": report.description,
        "status": report.status,
        "assigned_to": report.assigned_to,
        "resolution_notes": report.resolution_notes,
    })


# Library endpoints
@csrf_exempt
def list_libraries(request):
    """List all libraries"""
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    libraries = LibraryStatus.objects.all().order_by('name')
    libraries_data = []
    for library in libraries:
        occupancy_pct = (library.current_occupancy / library.max_capacity * 100) if library.max_capacity > 0 else 0
        libraries_data.append({
            "id": library.id,
            "name": library.name,
            "current_occupancy": library.current_occupancy,
            "max_capacity": library.max_capacity,
            "is_open": library.is_open,
            "occupancy_percentage": round(occupancy_pct, 1),
            "last_updated": library.last_updated.isoformat() if library.last_updated else None,
        })
    
    return JsonResponse({"libraries": libraries_data})


@csrf_exempt
def library_status(request):
    """Get single library by name (for backward compatibility)"""
    if request.method == "GET":
        name = request.GET.get("name", "Main Library")
        try:
            library = LibraryStatus.objects.get(name=name)
        except LibraryStatus.DoesNotExist:
            library, _ = LibraryStatus.objects.get_or_create(name=name)
        return JsonResponse({
            "id": library.id,
            "name": library.name,
            "current_occupancy": library.current_occupancy,
            "max_capacity": library.max_capacity,
            "is_open": library.is_open,
            "last_updated": library.last_updated.isoformat() if library.last_updated else None,
        })
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def create_library(request):
    """Create a new library - managers and admins only"""
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)

    body = _get_body(request)
    
    # Validate required fields
    name = body.get('name', '').strip()
    max_capacity = body.get('max_capacity', 100)
    
    if not name:
        return JsonResponse({"message": "Library name is required"}, status=400)
    
    if max_capacity <= 0:
        return JsonResponse({"message": "Max capacity must be greater than 0"}, status=400)

    # Check if library already exists
    if LibraryStatus.objects.filter(name=name).exists():
        return JsonResponse({"message": "Library with this name already exists"}, status=400)

    library = LibraryStatus.objects.create(
        name=name,
        max_capacity=max_capacity,
        current_occupancy=body.get('current_occupancy', 0),
        is_open=body.get('is_open', True),
        updated_by=user,
    )

    occupancy_pct = (library.current_occupancy / library.max_capacity * 100) if library.max_capacity > 0 else 0
    return JsonResponse({
        "message": "Library created successfully",
        "library": {
            "id": library.id,
            "name": library.name,
            "current_occupancy": library.current_occupancy,
            "max_capacity": library.max_capacity,
            "is_open": library.is_open,
            "occupancy_percentage": round(occupancy_pct, 1),
        }
    }, status=201)


@csrf_exempt
def library_update(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    body = _get_body(request)
    library_id = body.get("library_id")
    name = body.get("name")
    current_occupancy = body.get("current_occupancy")
    is_open = body.get("is_open")
    max_capacity = body.get("max_capacity")

    # Get library by ID or name (for backward compatibility)
    if library_id:
        try:
            library = LibraryStatus.objects.get(id=library_id)
        except LibraryStatus.DoesNotExist:
            return JsonResponse({"message": "Library not found"}, status=404)
    else:
        name = name or "Main Library"
        library, _ = LibraryStatus.objects.get_or_create(name=name)
    
    # Managers and admins can update directly, students/lecturers need approval
    if prof.role in ["manager", "admin"]:
        # Allow changing name for managers/admins
        if name and name != library.name:
            # Check if new name already exists
            if LibraryStatus.objects.filter(name=name).exclude(id=library.id).exists():
                return JsonResponse({"message": "Library with this name already exists"}, status=400)
            library.name = name
        
        if current_occupancy is not None:
            library.current_occupancy = current_occupancy
        if is_open is not None:
            library.is_open = is_open
        if max_capacity is not None and max_capacity > 0:
            library.max_capacity = max_capacity
        
        library.updated_by = user
        library.save()
        
        occupancy_pct = (library.current_occupancy / library.max_capacity * 100) if library.max_capacity > 0 else 0
        return JsonResponse({
            "message": "Library updated successfully",
            "library": {
                "id": library.id,
                "name": library.name,
                "current_occupancy": library.current_occupancy,
                "max_capacity": library.max_capacity,
                "is_open": library.is_open,
                "occupancy_percentage": round(occupancy_pct, 1),
                "last_updated": library.last_updated.isoformat() if library.last_updated else None,
            }
        })
    else:
        # For students/lecturers, use the old name-based approach
        name = name or library.name
        current_occupancy = current_occupancy if current_occupancy is not None else library.current_occupancy
        is_open = is_open if is_open is not None else library.is_open
        
        # Create a pending update request for students/lecturers
        update_request = LibraryUpdateRequest.objects.create(
            library=library,
            requested_by=user,
            requested_current_occupancy=current_occupancy,
            requested_is_open=is_open,
            status="pending"
        )
        
        occupancy_pct = (library.current_occupancy / library.max_capacity * 100) if library.max_capacity > 0 else 0
        return JsonResponse({
            "message": "Update request submitted. Waiting for manager approval.",
            "request_id": update_request.id,
            "status": "pending",
            "library": {
                "id": library.id,
                "name": library.name,
                "current_occupancy": library.current_occupancy,  # Current value, not requested
                "max_capacity": library.max_capacity,
                "is_open": library.is_open,
                "occupancy_percentage": round(occupancy_pct, 1),
                "last_updated": library.last_updated.isoformat() if library.last_updated else None,
            }
        })


# Lab endpoints
@csrf_exempt
def list_labs(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    labs = LabStatus.objects.all().order_by('building', 'room_number')
    labs_data = []
    for lab in labs:
        occupancy_pct = (lab.current_occupancy / lab.max_capacity * 100) if lab.max_capacity > 0 else 0
        labs_data.append({
            "id": lab.id,
            "name": lab.name,
            "building": lab.building,
            "room_number": lab.room_number,
            "current_occupancy": lab.current_occupancy,
            "max_capacity": lab.max_capacity,
            "is_available": lab.is_available,
            "equipment_status": lab.equipment_status,
            "occupancy_percentage": round(occupancy_pct, 1),
            "last_updated": lab.last_updated.isoformat() if lab.last_updated else None,
        })
    
    return JsonResponse({"labs": labs_data})


@csrf_exempt
def create_lab(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)

    body = _get_body(request)
    
    # Validate required fields
    building = body.get('building', '').strip()
    room_number = body.get('room_number', '').strip()
    name = body.get('name', '').strip() or f"Lab {room_number}"
    max_capacity = body.get('max_capacity', 30)
    
    if not building or not room_number:
        return JsonResponse({"message": "Building and room number are required"}, status=400)
    
    if max_capacity <= 0:
        return JsonResponse({"message": "Max capacity must be greater than 0"}, status=400)

    # Check if lab already exists
    if LabStatus.objects.filter(building=building, room_number=room_number).exists():
        return JsonResponse({"message": "Lab already exists"}, status=400)

    lab = LabStatus.objects.create(
        name=name,
        building=building,
        room_number=room_number,
        max_capacity=max_capacity,
        current_occupancy=body.get('current_occupancy', 0),
        is_available=body.get('is_available', True),
        equipment_status=body.get('equipment_status', ''),
        updated_by=user,
    )

    occupancy_pct = (lab.current_occupancy / lab.max_capacity * 100) if lab.max_capacity > 0 else 0
    return JsonResponse({
        "message": "Lab created successfully",
        "lab": {
            "id": lab.id,
            "name": lab.name,
            "building": lab.building,
            "room_number": lab.room_number,
            "max_capacity": lab.max_capacity,
            "current_occupancy": lab.current_occupancy,
            "is_available": lab.is_available,
            "equipment_status": lab.equipment_status,
            "occupancy_percentage": round(occupancy_pct, 1),
        }
    }, status=201)


@csrf_exempt
def update_lab(request, lab_id):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    try:
        lab = LabStatus.objects.get(id=lab_id)
    except LabStatus.DoesNotExist:
        return JsonResponse({"message": "Lab not found"}, status=404)

    prof, _ = Profile.objects.get_or_create(user=user)
    body = _get_body(request)
    
    # Managers and admins can update directly, students/lecturers need approval
    if prof.role in ["manager", "admin"]:
        if "current_occupancy" in body:
            lab.current_occupancy = body["current_occupancy"]
        if "is_available" in body:
            lab.is_available = body["is_available"]
        
        lab.updated_by = user
        lab.save()

        occupancy_pct = (lab.current_occupancy / lab.max_capacity * 100) if lab.max_capacity > 0 else 0
        return JsonResponse({
            "message": "Lab status updated",
            "lab": {
                "id": lab.id,
                "name": lab.name,
                "current_occupancy": lab.current_occupancy,
                "max_capacity": lab.max_capacity,
                "is_available": lab.is_available,
                "occupancy_percentage": round(occupancy_pct, 1),
            }
        })
    else:
        # Create a pending update request for students/lecturers
        requested_occupancy = body.get("current_occupancy") if "current_occupancy" in body else None
        requested_available = body.get("is_available") if "is_available" in body else None
        
        if requested_occupancy is None and requested_available is None:
            return JsonResponse({"message": "No changes specified"}, status=400)
        
        update_request = LabUpdateRequest.objects.create(
            lab=lab,
            requested_by=user,
            requested_current_occupancy=requested_occupancy,
            requested_is_available=requested_available,
            status="pending"
        )
        
        occupancy_pct = (lab.current_occupancy / lab.max_capacity * 100) if lab.max_capacity > 0 else 0
        return JsonResponse({
            "message": "Update request submitted. Waiting for manager approval.",
            "request_id": update_request.id,
            "status": "pending",
            "lab": {
                "id": lab.id,
                "name": lab.name,
                "current_occupancy": lab.current_occupancy,  # Current value, not requested
                "max_capacity": lab.max_capacity,
                "is_available": lab.is_available,
                "occupancy_percentage": round(occupancy_pct, 1),
            }
        })


# Classroom endpoints
@csrf_exempt
def list_classrooms(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    classrooms = ClassroomStatus.objects.all().order_by('building', 'room_number')
    classrooms_data = []
    for classroom in classrooms:
        occupancy_pct = (classroom.current_occupancy / classroom.max_capacity * 100) if classroom.max_capacity > 0 else 0
        classrooms_data.append({
            "id": classroom.id,
            "name": classroom.name,
            "building": classroom.building,
            "room_number": classroom.room_number,
            "current_occupancy": classroom.current_occupancy,
            "max_capacity": classroom.max_capacity,
            "is_available": classroom.is_available,
            "occupancy_percentage": round(occupancy_pct, 1),
            "last_updated": classroom.last_updated.isoformat() if classroom.last_updated else None,
        })
    
    return JsonResponse({"classrooms": classrooms_data})


@csrf_exempt
def create_classroom(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)

    body = _get_body(request)
    
    # Validate required fields
    building = body.get('building', '').strip()
    room_number = body.get('room_number', '').strip()
    name = body.get('name', '').strip() or f"Classroom {room_number}"
    max_capacity = body.get('max_capacity', 50)
    
    if not building or not room_number:
        return JsonResponse({"message": "Building and room number are required"}, status=400)
    
    if max_capacity <= 0:
        return JsonResponse({"message": "Max capacity must be greater than 0"}, status=400)

    # Check if classroom already exists
    if ClassroomStatus.objects.filter(building=building, room_number=room_number).exists():
        return JsonResponse({"message": "Classroom already exists"}, status=400)

    classroom = ClassroomStatus.objects.create(
        name=name,
        building=building,
        room_number=room_number,
        max_capacity=max_capacity,
        current_occupancy=body.get('current_occupancy', 0),
        is_available=body.get('is_available', True),
        updated_by=user,
    )

    return JsonResponse({
        "message": "Classroom created successfully",
        "classroom": {
            "id": classroom.id,
            "name": classroom.name,
            "building": classroom.building,
            "room_number": classroom.room_number,
            "max_capacity": classroom.max_capacity,
            "current_occupancy": classroom.current_occupancy,
            "is_available": classroom.is_available,
        }
    }, status=201)


@csrf_exempt
def update_classroom(request, classroom_id):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    try:
        classroom = ClassroomStatus.objects.get(id=classroom_id)
    except ClassroomStatus.DoesNotExist:
        return JsonResponse({"message": "Classroom not found"}, status=404)

    body = _get_body(request)
    if "current_occupancy" in body:
        classroom.current_occupancy = body["current_occupancy"]
    if "is_available" in body:
        classroom.is_available = body["is_available"]
    
    classroom.updated_by = user
    classroom.save()

    occupancy_pct = (classroom.current_occupancy / classroom.max_capacity * 100) if classroom.max_capacity > 0 else 0
    return JsonResponse({
        "message": "Classroom status updated",
        "classroom": {
            "id": classroom.id,
            "name": classroom.name,
            "current_occupancy": classroom.current_occupancy,
            "max_capacity": classroom.max_capacity,
            "is_available": classroom.is_available,
            "occupancy_percentage": round(occupancy_pct, 1),
        }
    })


# Fault endpoints
@csrf_exempt
def list_faults(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    
    # Managers and admins see all faults, others see only their own
    if prof.role in ['manager', 'admin']:
        faults = FaultReport.objects.all().order_by('-created_at')
    else:
        faults = FaultReport.objects.filter(reporter=user).order_by('-created_at')

    faults_data = []
    for fault in faults:
        faults_data.append({
            "id": fault.id,
            "title": fault.title,
            "description": fault.description,
            "building": fault.building,
            "room_number": fault.room_number,
            "category": fault.category,
            "severity": fault.severity,
            "status": fault.status,
            "assigned_to": fault.assigned_to,
            "resolution_notes": fault.resolution_notes,
            "created_date": fault.created_at.isoformat() if fault.created_at else None,
            "updated_at": fault.updated_at.isoformat() if fault.updated_at else None,
            "reporter_name": fault.reporter.get_full_name() or fault.reporter.username,
            "reporter_email": fault.reporter.email,
        })
    
    return JsonResponse({"faults": faults_data})


@csrf_exempt
def update_fault(request, fault_id):
    if request.method != "PUT":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ['manager', 'admin']:
        return JsonResponse({"message": "Only managers and admins can update faults"}, status=403)

    try:
        fault = FaultReport.objects.get(id=fault_id)
    except FaultReport.DoesNotExist:
        return JsonResponse({"message": "Fault not found"}, status=404)

    body = _get_body(request)
    
    if 'status' in body:
        fault.status = body['status']
        if body['status'] in ['resolved', 'closed'] and not fault.resolved_at:
            fault.resolved_at = timezone.now()
    
    if 'assigned_to' in body:
        fault.assigned_to = body['assigned_to']
    
    if 'resolution_notes' in body:
        fault.resolution_notes = body['resolution_notes']
    
    fault.save()

    return JsonResponse({
        "message": "Fault updated",
        "fault": {
            "id": fault.id,
            "status": fault.status,
            "assigned_to": fault.assigned_to,
            "resolution_notes": fault.resolution_notes,
        }
    })


@csrf_exempt
def create_fault(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    body = _get_body(request)
    
    fault = FaultReport.objects.create(
        title=body.get('title', ''),
        description=body.get('description', ''),
        building=body.get('building', ''),
        room_number=body.get('room_number', ''),
        category=body.get('category', 'other'),
        severity=body.get('severity', 'medium'),
        location_type=body.get('location_type', 'classroom'),
        reporter=user,
    )

    return JsonResponse({
        "message": "Fault reported",
        "fault": {
            "id": fault.id,
            "title": fault.title,
        }
    }, status=201)


# Admin endpoints
@csrf_exempt
def admin_users(request):
    """Get all users - admin only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Admin access required"}, status=403)
    
    if request.method == "GET":
        users = User.objects.all().order_by('-date_joined')
        users_data = []
        for u in users:
            uprof, _ = Profile.objects.get_or_create(user=u)
            users_data.append({
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "role": uprof.role,
                "department": uprof.department,
                "manager_type": uprof.manager_type,
                "date_joined": u.date_joined.isoformat() if u.date_joined else None,
                "is_active": u.is_active,
            })
        return JsonResponse({"users": users_data})
    
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def admin_role_requests(request):
    """Get all role requests - admin only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Admin access required"}, status=403)
    
    if request.method == "GET":
        requests = RoleRequest.objects.all().order_by('-requested_at')
        requests_data = []
        for req in requests:
            requests_data.append({
                "id": req.id,
                "user_id": req.user.id,
                "user_email": req.user.email,
                "user_username": req.user.username,
                "requested_role": req.requested_role,
                "manager_type": req.manager_type,
                "reason": req.reason,
                "status": req.status,
                "requested_at": req.requested_at.isoformat() if req.requested_at else None,
                "approved_by": req.approved_by.email if req.approved_by else None,
                "approved_at": req.approved_at.isoformat() if req.approved_at else None,
                "rejection_reason": req.rejection_reason,
            })
        return JsonResponse({"requests": requests_data})
    
    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def admin_approve_role(request, request_id):
    """Approve a role request - admin only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Admin access required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    try:
        role_request = RoleRequest.objects.get(id=request_id)
    except RoleRequest.DoesNotExist:
        return JsonResponse({"message": "Role request not found"}, status=404)
    
    if role_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)
    
    # Update the user's profile
    user_prof, _ = Profile.objects.get_or_create(user=role_request.user)
    user_prof.role = role_request.requested_role
    if role_request.requested_role == "manager" and role_request.manager_type:
        user_prof.manager_type = role_request.manager_type
    user_prof.save()
    
    # Update the role request
    role_request.status = "approved"
    role_request.approved_by = user
    role_request.approved_at = timezone.now()
    role_request.save()
    
    return JsonResponse({
        "message": "Role request approved",
        "user": _user_to_dict(role_request.user)
    })


@csrf_exempt
def admin_reject_role(request, request_id):
    """Reject a role request - admin only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Admin access required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    try:
        role_request = RoleRequest.objects.get(id=request_id)
    except RoleRequest.DoesNotExist:
        return JsonResponse({"message": "Role request not found"}, status=404)
    
    if role_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)
    
    body = _get_body(request)
    rejection_reason = body.get("rejection_reason", "")
    
    # Update the role request
    role_request.status = "rejected"
    role_request.approved_by = user
    role_request.approved_at = timezone.now()
    role_request.rejection_reason = rejection_reason
    role_request.save()
    
    return JsonResponse({"message": "Role request rejected"})


@csrf_exempt
def admin_stats(request):
    """Get admin dashboard statistics"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Admin access required"}, status=403)
    
    if request.method == "GET":
        total_users = User.objects.count()
        students = Profile.objects.filter(role="student").count()
        lecturers = Profile.objects.filter(role="lecturer").count()
        managers = Profile.objects.filter(role="manager").count()
        admins = Profile.objects.filter(role="admin").count()
        
        pending_requests = RoleRequest.objects.filter(status="pending").count()
        total_faults = FaultReport.objects.count()
        open_faults = FaultReport.objects.filter(status__in=["open", "in_progress"]).count()
        
        return JsonResponse({
            "users": {
                "total": total_users,
                "students": students,
                "lecturers": lecturers,
                "managers": managers,
                "admins": admins,
            },
            "pending_role_requests": pending_requests,
            "faults": {
                "total": total_faults,
                "open": open_faults,
            }
        })
    
    return JsonResponse({"message": "Method not allowed"}, status=405)


# Update Request endpoints for managers
@csrf_exempt
def list_pending_updates(request):
    """List all pending library and lab update requests - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)
    
    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    library_requests = LibraryUpdateRequest.objects.filter(status="pending").order_by('-requested_at')
    lab_requests = LabUpdateRequest.objects.filter(status="pending").order_by('-requested_at')
    
    library_data = []
    for req in library_requests:
        library_data.append({
            "id": req.id,
            "type": "library",
            "library_name": req.library.name,
            "library_id": req.library.id,
            "current_occupancy": req.library.current_occupancy,
            "current_is_open": req.library.is_open,
            "requested_occupancy": req.requested_current_occupancy,
            "requested_is_open": req.requested_is_open,
            "requested_by": req.requested_by.email,
            "requested_by_name": req.requested_by.get_full_name() or req.requested_by.username,
            "requested_at": req.requested_at.isoformat() if req.requested_at else None,
        })
    
    lab_data = []
    for req in lab_requests:
        lab_data.append({
            "id": req.id,
            "type": "lab",
            "lab_id": req.lab.id,
            "lab_name": req.lab.name,
            "building": req.lab.building,
            "room_number": req.lab.room_number,
            "current_occupancy": req.lab.current_occupancy,
            "current_is_available": req.lab.is_available,
            "requested_occupancy": req.requested_current_occupancy,
            "requested_is_available": req.requested_is_available,
            "requested_by": req.requested_by.email,
            "requested_by_name": req.requested_by.get_full_name() or req.requested_by.username,
            "requested_at": req.requested_at.isoformat() if req.requested_at else None,
        })
    
    return JsonResponse({
        "library_requests": library_data,
        "lab_requests": lab_data,
        "total_pending": len(library_data) + len(lab_data)
    })


@csrf_exempt
def approve_library_update(request, request_id):
    """Approve a library update request - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    try:
        update_request = LibraryUpdateRequest.objects.get(id=request_id)
    except LibraryUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    
    if update_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)
    
    # Apply the update
    library = update_request.library
    library.current_occupancy = update_request.requested_current_occupancy
    library.is_open = update_request.requested_is_open
    library.updated_by = user
    library.save()
    
    # Update the request status
    update_request.status = "approved"
    update_request.approved_by = user
    update_request.approved_at = timezone.now()
    update_request.save()
    
    return JsonResponse({
        "message": "Library update approved and applied",
        "library": {
            "name": library.name,
            "current_occupancy": library.current_occupancy,
            "is_open": library.is_open,
        }
    })


@csrf_exempt
def reject_library_update(request, request_id):
    """Reject a library update request - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    try:
        update_request = LibraryUpdateRequest.objects.get(id=request_id)
    except LibraryUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    
    if update_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)
    
    body = _get_body(request)
    rejection_reason = body.get("rejection_reason", "")
    
    # Update the request status
    update_request.status = "rejected"
    update_request.approved_by = user
    update_request.approved_at = timezone.now()
    update_request.rejection_reason = rejection_reason
    update_request.save()
    
    return JsonResponse({"message": "Library update request rejected"})


@csrf_exempt
def approve_lab_update(request, request_id):
    """Approve a lab update request - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    try:
        update_request = LabUpdateRequest.objects.get(id=request_id)
    except LabUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    
    if update_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)
    
    # Apply the update
    lab = update_request.lab
    if update_request.requested_current_occupancy is not None:
        lab.current_occupancy = update_request.requested_current_occupancy
    if update_request.requested_is_available is not None:
        lab.is_available = update_request.requested_is_available
    lab.updated_by = user
    lab.save()
    
    # Update the request status
    update_request.status = "approved"
    update_request.approved_by = user
    update_request.approved_at = timezone.now()
    update_request.save()
    
    occupancy_pct = (lab.current_occupancy / lab.max_capacity * 100) if lab.max_capacity > 0 else 0
    return JsonResponse({
        "message": "Lab update approved and applied",
        "lab": {
            "id": lab.id,
            "name": lab.name,
            "current_occupancy": lab.current_occupancy,
            "is_available": lab.is_available,
            "occupancy_percentage": round(occupancy_pct, 1),
        }
    })


@csrf_exempt
def reject_lab_update(request, request_id):
    """Reject a lab update request - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)
    
    try:
        update_request = LabUpdateRequest.objects.get(id=request_id)
    except LabUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    
    if update_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)
    
    body = _get_body(request)
    rejection_reason = body.get("rejection_reason", "")
    
    # Update the request status
    update_request.status = "rejected"
    update_request.approved_by = user
    update_request.approved_at = timezone.now()
    update_request.rejection_reason = rejection_reason
    update_request.save()
    
    return JsonResponse({"message": "Lab update request rejected"})


# Room Request endpoints
@csrf_exempt
def create_room_request(request):
    """Create a room request - lecturers only"""
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "lecturer":
        return JsonResponse({"message": "Only lecturers can request rooms"}, status=403)

    body = _get_body(request)
    room_type = body.get("room_type", "").strip().lower()
    purpose = body.get("purpose", "").strip()
    expected_attendees = body.get("expected_attendees", 1)
    requested_date = body.get("requested_date")
    start_time = body.get("start_time")
    end_time = body.get("end_time")
    room_id = body.get("room_id")  # Optional: specific room requested

    if not room_type or room_type not in ["classroom", "lab"]:
        return JsonResponse({"message": "Invalid room type. Must be 'classroom' or 'lab'"}, status=400)
    
    if not purpose:
        return JsonResponse({"message": "Purpose is required"}, status=400)
    
    if not requested_date or not start_time or not end_time:
        return JsonResponse({"message": "Date, start time, and end time are required"}, status=400)

    # Parse date and time strings
    try:
        parsed_date = datetime.strptime(requested_date, "%Y-%m-%d").date()
        parsed_start_time = datetime.strptime(start_time, "%H:%M").time()
        parsed_end_time = datetime.strptime(end_time, "%H:%M").time()
    except ValueError as e:
        return JsonResponse({"message": f"Invalid date or time format: {str(e)}"}, status=400)

    # Create the request
    room_request = RoomRequest.objects.create(
        requested_by=user,
        room_type=room_type,
        purpose=purpose,
        expected_attendees=expected_attendees,
        requested_date=parsed_date,
        start_time=parsed_start_time,
        end_time=parsed_end_time,
        status="pending"
    )

    # If a specific room was requested, assign it
    if room_id:
        if room_type == "classroom":
            try:
                room_request.classroom = ClassroomStatus.objects.get(id=room_id)
            except ClassroomStatus.DoesNotExist:
                pass
        else:
            try:
                room_request.lab = LabStatus.objects.get(id=room_id)
            except LabStatus.DoesNotExist:
                pass
        room_request.save()

    return JsonResponse({
        "message": "Room request submitted successfully",
        "request": {
            "id": room_request.id,
            "room_type": room_request.room_type,
            "purpose": room_request.purpose,
            "status": room_request.status,
            "requested_date": room_request.requested_date.isoformat() if room_request.requested_date else None,
        }
    }, status=201)


@csrf_exempt
def list_room_requests(request):
    """List room requests - lecturers see their own, managers see all"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    if request.method != "GET":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    prof, _ = Profile.objects.get_or_create(user=user)
    
    # Lecturers see only their requests, managers/admins see all
    if prof.role in ["manager", "admin"]:
        requests = RoomRequest.objects.all().order_by('-requested_at')
    else:
        requests = RoomRequest.objects.filter(requested_by=user).order_by('-requested_at')

    requests_data = []
    for req in requests:
        room_info = None
        if req.classroom:
            room_info = {
                "id": req.classroom.id,
                "name": req.classroom.name,
                "building": req.classroom.building,
                "room_number": req.classroom.room_number,
                "type": "classroom"
            }
        elif req.lab:
            room_info = {
                "id": req.lab.id,
                "name": req.lab.name,
                "building": req.lab.building,
                "room_number": req.lab.room_number,
                "type": "lab"
            }

        requests_data.append({
            "id": req.id,
            "room_type": req.room_type,
            "purpose": req.purpose,
            "expected_attendees": req.expected_attendees,
            "requested_date": req.requested_date.isoformat() if req.requested_date else None,
            "start_time": req.start_time.isoformat() if req.start_time else None,
            "end_time": req.end_time.isoformat() if req.end_time else None,
            "status": req.status,
            "requested_by": req.requested_by.email,
            "requested_by_name": req.requested_by.get_full_name() or req.requested_by.username,
            "requested_at": req.requested_at.isoformat() if req.requested_at else None,
            "assigned_room": room_info,
            "approved_by": req.approved_by.email if req.approved_by else None,
            "approved_at": req.approved_at.isoformat() if req.approved_at else None,
            "rejection_reason": req.rejection_reason,
        })

    return JsonResponse({"requests": requests_data})


@csrf_exempt
def approve_room_request(request, request_id):
    """Approve a room request and assign a room - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)

    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        room_request = RoomRequest.objects.get(id=request_id)
    except RoomRequest.DoesNotExist:
        return JsonResponse({"message": "Room request not found"}, status=404)

    if room_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)

    body = _get_body(request)
    room_id = body.get("room_id")

    if not room_id:
        return JsonResponse({"message": "Room ID is required to approve the request"}, status=400)

    # Assign the room based on type
    if room_request.room_type == "classroom":
        try:
            classroom = ClassroomStatus.objects.get(id=room_id)
            # Check if room is available
            if not classroom.is_available:
                return JsonResponse({"message": "Selected classroom is not available"}, status=400)
            room_request.classroom = classroom
            # Mark room as unavailable
            classroom.is_available = False
            classroom.updated_by = user
            classroom.save()
        except ClassroomStatus.DoesNotExist:
            return JsonResponse({"message": "Classroom not found"}, status=404)
    else:  # lab
        try:
            lab = LabStatus.objects.get(id=room_id)
            # Check if room is available
            if not lab.is_available:
                return JsonResponse({"message": "Selected lab is not available"}, status=400)
            room_request.lab = lab
            # Mark room as unavailable
            lab.is_available = False
            lab.updated_by = user
            lab.save()
        except LabStatus.DoesNotExist:
            return JsonResponse({"message": "Lab not found"}, status=404)

    # Update request status
    room_request.status = "approved"
    room_request.approved_by = user
    room_request.approved_at = timezone.now()
    room_request.save()

    room_name = room_request.classroom.name if room_request.classroom else (room_request.lab.name if room_request.lab else "Unknown")
    return JsonResponse({
        "message": f"Room request approved. {room_name} has been assigned and marked as unavailable.",
        "request": {
            "id": room_request.id,
            "status": room_request.status,
            "assigned_room": room_name,
        }
    })


@csrf_exempt
def reject_room_request(request, request_id):
    """Reject a room request - managers and admins only"""
    user = _auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)

    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Manager or admin access required"}, status=403)

    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    try:
        room_request = RoomRequest.objects.get(id=request_id)
    except RoomRequest.DoesNotExist:
        return JsonResponse({"message": "Room request not found"}, status=404)

    if room_request.status != "pending":
        return JsonResponse({"message": "Request is not pending"}, status=400)

    body = _get_body(request)
    rejection_reason = body.get("rejection_reason", "")

    # Update request status
    room_request.status = "rejected"
    room_request.approved_by = user
    room_request.approved_at = timezone.now()
    room_request.rejection_reason = rejection_reason
    room_request.save()

    return JsonResponse({"message": "Room request rejected"})
