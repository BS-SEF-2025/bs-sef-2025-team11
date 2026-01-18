import json
from datetime import datetime, date, time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Count, Q
from .models import (
    Profile, RoleRequest, LibraryStatus, LabStatus, ClassroomStatus,
    LibraryUpdateRequest, LabUpdateRequest, RoomRequest, FaultReport,
    OverloadRecord, Notification
)
from .jwt import encode_token, decode_token
from .auth import get_user_from_request, require_auth

def _user_to_dict(user):
    prof, _ = Profile.objects.get_or_create(user=user)
    # Ensure role is never None - default to "student"
    role = prof.role or "student"
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": role,
        "department": prof.department if prof.department is not None else "",
        "manager_type": prof.manager_type,
    }

@csrf_exempt
@require_http_methods(["GET"])
def test_endpoint(request):
    return JsonResponse({"message": "Backend is running"})

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
@require_auth
def test_auth(request):
    """Test endpoint to verify authentication is working"""
    if request.method == "OPTIONS":
        # Handle preflight
        return JsonResponse({"message": "OK"})
    user = request.user_obj
    return JsonResponse({
        "message": "Authentication working",
        "user": user.email if user else None,
        "user_id": user.id if user else None
    })

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        
        if not email or not password:
            return JsonResponse({"message": "Email and password are required"}, status=400)
        
        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            return JsonResponse({"message": "User already exists"}, status=400)
        
        # Create user
        user = User.objects.create_user(username=email, email=email, password=password)
        # Ensure user is saved and has an ID
        user.save()
        print(f"DEBUG: User created - ID: {user.id}, Email: {user.email}")
        
        # Create profile WITHOUT setting a role - user must select role after registration
        # The Profile model has default='student', but we'll leave it empty initially
        # so users are forced to select a role
        profile, created = Profile.objects.get_or_create(user=user)
        # Explicitly set role to empty string or None to force role selection
        # Actually, let's set it to 'student' as default, but allow role selection page
        # to be accessible for students who want to request lecturer/manager roles
        if not profile.role:
            profile.role = 'student'  # Default to student, but they can still access role selection
            profile.save()
        
        # CRITICAL: Verify user exists in database before generating token
        user_check = User.objects.filter(id=user.id).first()
        if not user_check:
            print(f"ERROR: User {user.id} not found in database after creation!")
            return JsonResponse({"message": "Error creating user account"}, status=500)
        
        print(f"DEBUG: User verified in database - ID: {user_check.id}")
        
        # Ensure user.id is valid before encoding
        if not user_check.id:
            print(f"ERROR: User ID is None or invalid: {user_check.id}")
            return JsonResponse({"message": "Error: Invalid user ID"}, status=500)
        
        # Generate token using the verified user ID
        try:
            print(f"DEBUG: About to encode token for user_id={user_check.id} (type: {type(user_check.id)})")
            token = encode_token(user_check.id)
            
            # CRITICAL: Ensure token is a clean string
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            elif not isinstance(token, str):
                token = str(token)
            token = token.strip()  # Remove any whitespace
            
            print(f"DEBUG: Registration - Token generated for user {user.id}")
            print(f"DEBUG: Registration - Token type: {type(token)}")
            print(f"DEBUG: Registration - Token length: {len(token)}")
            print(f"DEBUG: Registration - Token (first 50 chars): {token[:50]}...")
            
            # Don't verify token here - it should work, and verification might fail due to timing
            # The token will be verified when it's used (e.g., in set-role)
            
        except Exception as token_error:
            error_type = type(token_error).__name__
            error_msg = str(token_error)
            print(f"ERROR: Registration - Token encoding FAILED")
            print(f"ERROR: Exception type: {error_type}")
            print(f"ERROR: Exception message: {error_msg}")
            print(f"ERROR: User ID that failed: {user_check.id if 'user_check' in locals() else 'unknown'}")
            import traceback
            traceback.print_exc()
            return JsonResponse({
                "message": f"Error generating authentication token: {error_msg}",
                "error_type": error_type
            }, status=500)
        
        # Return response
        response_data = {
            "token": token,
            "user": _user_to_dict(user),
            "message": "Registration successful"
        }
        print(f"DEBUG: Registration - Returning response with token and user: {user.email}")
        return JsonResponse(response_data)
    except Exception as e:
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"message": f"Server error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        print(f"DEBUG: Login Request Body: {request.body}")
        data = json.loads(request.body)
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        print(f"DEBUG: Login Email: '{email}', Password: '{password}'")
        
        user = authenticate(username=email, password=password)
        print(f"DEBUG: Authenticate result: {user}")
        if not user:
            return JsonResponse({"message": "Invalid credentials"}, status=401)
        
        token = encode_token(user.id)
        return JsonResponse({
            "token": token,
            "user": _user_to_dict(user),
            "message": "Login successful"
        })
    except Exception as e:
        return JsonResponse({"message": f"Server error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def me(request):
    # Handle OPTIONS preflight request
    if request.method == "OPTIONS":
        return JsonResponse({"message": "OK"})
    
    print(f"DEBUG: /api/auth/me called")
    if hasattr(request, 'headers'):
        print(f"DEBUG: Authorization header: {request.headers.get('Authorization', 'NOT SET')[:50]}...")
    print(f"DEBUG: HTTP_AUTHORIZATION: {request.META.get('HTTP_AUTHORIZATION', 'NOT SET')[:50]}...")
    
    user = get_user_from_request(request)
    if not user:
        print("DEBUG: /api/auth/me: User not found, returning 401")
        return JsonResponse({"message": "Unauthorized - Please log in again"}, status=401)
    print(f"DEBUG: /api/auth/me: Returning user data for {user.email}")
    return JsonResponse({"user": _user_to_dict(user)})

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
@require_auth
def set_role(request):
    # Handle OPTIONS preflight request
    if request.method == "OPTIONS":
        return JsonResponse({"message": "OK"})
    try:
        user = request.user_obj
        print(f"DEBUG: ========== set_role ENDPOINT CALLED ==========")
        print(f"DEBUG: Request method: {request.method}")
        print(f"DEBUG: User from request: {user.email if user else 'None'}")
        print(f"DEBUG: User ID: {user.id if user else 'None'}")
        
        if not user:
            print("DEBUG: ERROR - user_obj is None - authentication failed")
            print(f"DEBUG: Request method: {request.method}")
            if hasattr(request, 'headers'):
                print(f"DEBUG: request.headers: {dict(request.headers)}")
            print(f"DEBUG: request.META keys with AUTH: {[k for k in request.META.keys() if 'AUTH' in k.upper()]}")
            return JsonResponse({"message": "Unauthorized - user not found"}, status=401)
        
        data = json.loads(request.body)
        role = data.get("role")
        reason = data.get("reason", "")
        manager_type = data.get("manager_type", "")
        
        if not role:
            return JsonResponse({"message": "Role is required"}, status=400)
        
        # Validate role
        valid_roles = ["student", "lecturer", "manager", "admin"]
        if role not in valid_roles:
            return JsonResponse({"message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}, status=400)
        
        prof, _ = Profile.objects.get_or_create(user=user)
        current_role = prof.role or "student"  # Default to student if role is None/empty
        
        print(f"DEBUG: Current role: '{current_role}', Requested role: '{role}'")
        
        # If user already has a confirmed non-student role, prevent changes (except admin setting admin)
        if current_role not in ["student", None, ""]:
            # Allow admin role to be set if user is superuser
            if role == "admin" and user.is_superuser:
                # Superuser can set admin role
                pass
            elif current_role != "student":
                # Check if there's already a pending request
                existing_pending = RoleRequest.objects.filter(user=user, status="pending").exists()
                if existing_pending:
                    return JsonResponse({
                        "message": "You already have a pending role request. Please wait for admin approval.",
                        "pending_request": True
                    }, status=400)
                # User already has a confirmed role (lecturer, manager, admin)
                return JsonResponse({
                    "message": f"You already have the role '{current_role}'. Role changes are not allowed. Please contact an admin if you need to change your role.",
                }, status=400)
        
        # Check if student already has a pending request for the same role
        if current_role == "student" or not prof.role:
            existing_pending = RoleRequest.objects.filter(user=user, status="pending", requested_role=role).exists()
            if existing_pending:
                return JsonResponse({
                    "message": f"You already have a pending request for {role} role. Please wait for admin approval.",
                    "pending_request": True
                }, status=400)
        
        # Save manager_type to profile if provided (for manager role requests)
        if manager_type:
            prof.manager_type = manager_type
            prof.save()
        
        # Handle role assignment
        if role in ["lecturer", "manager", "student"]:
            # Create role request but keep user as student (or pre-student) until approved
            # For student role, they might not have any role yet
            RoleRequest.objects.create(
                user=user,
                requested_role=role,
                reason=reason,
                status="pending"
            )
            # Notify managers and admins
            managers = User.objects.filter(profile__role__in=["manager", "admin"])
            for m in managers:
                Notification.objects.create(
                    user=m,
                    title="New Role Request",
                    message=f"{user.email} requested to be a {role}.",
                    action_link="/manager-requests"
                )
            return JsonResponse({
                "user": _user_to_dict(user),
                "message": f"Role request for {role} submitted for approval.",
                "pending_request": True
            })
        elif role == "admin":
            # Admin role requires special handling - only allow if user is superuser
            # For regular users, create a request
            if user.is_superuser:
                prof.role = "admin"
                prof.save()
                return JsonResponse({
                    "user": _user_to_dict(user),
                    "message": "Admin role set successfully",
                    "pending_request": False
                })
            else:
                # Regular users cannot set admin role directly - create request
                RoleRequest.objects.create(
                    user=user,
                    requested_role=role,
                    reason=reason or "Admin role request",
                    status="pending"
                )
                # Notify managers and admins
                managers = User.objects.filter(profile__role__in=["manager", "admin"])
                for m in managers:
                    Notification.objects.create(
                        user=m,
                        title="New Admin Request",
                        message=f"{user.email} requested admin access.",
                        action_link="/manager-requests"
                    )
                return JsonResponse({
                    "user": _user_to_dict(user),
                    "message": "Admin role request submitted for approval. You can use the system as a student for now.",
                    "pending_request": True
                })
        else:
            # Fallback for any other roles (shouldn't happen with validation)
            pass
            print(f"DEBUG: Role set to '{role}' for user {user.email}")
            return JsonResponse({
                "user": _user_to_dict(user),
                "message": "Role updated successfully",
                "pending_request": False
            })
    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid JSON in request body"}, status=400)
    except Exception as e:
        import traceback
        print(f"Error in set_role: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Library endpoints
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_libraries(request):
    libraries = LibraryStatus.objects.all().order_by("name")
    return JsonResponse({
        "libraries": [{
            "id": lib.id,
            "name": lib.name,
            "max_capacity": lib.max_capacity,
            "current_occupancy": lib.current_occupancy,
            "is_open": lib.is_open,
        } for lib in libraries]
    })

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def library_status(request):
    lib = LibraryStatus.objects.first()
    if not lib:
        return JsonResponse({"message": "No library found"}, status=404)
    return JsonResponse({
        "id": lib.id,
        "name": lib.name,
        "max_capacity": lib.max_capacity,
        "current_occupancy": lib.current_occupancy,
        "is_open": lib.is_open,
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_library(request):
    user = request.user_obj
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    user_role = prof.role or "student"
    
    print(f"DEBUG: create_library - user: {user.email}, role: {user_role}")
    
    if user_role not in ["manager", "admin"]:
        return JsonResponse({
            "message": f"Only managers and admins can create libraries. Your current role is: {user_role}"
        }, status=403)
    
    try:
        data = json.loads(request.body)
        name = data.get("name", "").strip()
        if not name:
            return JsonResponse({"message": "Library name is required"}, status=400)
        
        lib = LibraryStatus.objects.create(
            name=name,
            max_capacity=data.get("max_capacity", 100),
            current_occupancy=data.get("current_occupancy", 0),
            is_open=data.get("is_open", True),
        )
        print(f"DEBUG: Library created successfully: {lib.name}")
        return JsonResponse({
            "library": {
                "id": lib.id,
                "name": lib.name,
                "max_capacity": lib.max_capacity,
                "current_occupancy": lib.current_occupancy,
                "is_open": lib.is_open,
            },
            "message": "Library created successfully"
        })
    except Exception as e:
        import traceback
        print(f"Error creating library: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def library_update(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    
    try:
        data = json.loads(request.body)
        library_id = data.get("library_id")
        
        if not library_id:
            return JsonResponse({"message": "library_id is required"}, status=400)
        
        try:
            lib = LibraryStatus.objects.get(id=library_id)
        except LibraryStatus.DoesNotExist:
            return JsonResponse({"message": "Library not found"}, status=404)
        
        # Managers and admins can update directly
        if prof.role in ["manager", "admin"]:
            if "name" in data:
                lib.name = data["name"]
            if "max_capacity" in data:
                lib.max_capacity = data["max_capacity"]
            if "current_occupancy" in data:
                lib.current_occupancy = data["current_occupancy"]
            if "is_open" in data:
                lib.is_open = data["is_open"]
            lib.save()
            return JsonResponse({
                "library": {
                    "id": lib.id,
                    "name": lib.name,
                    "max_capacity": lib.max_capacity,
                    "current_occupancy": lib.current_occupancy,
                    "is_open": lib.is_open,
                },
                "status": "updated",
                "message": "Library updated successfully"
            })
        else:
            # Students/lecturers create update requests
            LibraryUpdateRequest.objects.create(
                library=lib,
                requested_by=user,
                requested_current_occupancy=data.get("current_occupancy", lib.current_occupancy),
                requested_is_open=data.get("is_open", lib.is_open),
                requested_name=data.get("name", lib.name),
                requested_max_capacity=data.get("max_capacity", lib.max_capacity),
            )
            return JsonResponse({
                "status": "pending",
                "message": "Update request submitted. Waiting for manager approval."
            })
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Lab endpoints
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_labs(request):
    labs = LabStatus.objects.all().order_by("building", "name")
    return JsonResponse({
        "labs": [{
            "id": lab.id,
            "name": lab.name,
            "building": lab.building,
            "room_number": lab.room_number,
            "max_capacity": lab.max_capacity,
            "current_occupancy": lab.current_occupancy,
            "is_available": lab.is_available,
            "equipment_status": lab.equipment_status,
        } for lab in labs]
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_lab(request):
    user = request.user_obj
    if not user:
        return JsonResponse({"message": "Unauthorized"}, status=401)
    
    prof, _ = Profile.objects.get_or_create(user=user)
    user_role = prof.role or "student"
    
    print(f"DEBUG: create_lab - user: {user.email}, role: {user_role}")
    
    if user_role not in ["manager", "admin"]:
        return JsonResponse({
            "message": f"Only managers and admins can create labs. Your current role is: {user_role}"
        }, status=403)
    
    try:
        data = json.loads(request.body)
        name = data.get("name", "").strip()
        if not name:
            return JsonResponse({"message": "Lab name is required"}, status=400)
        
        lab = LabStatus.objects.create(
            name=name,
            building=data.get("building", ""),
            room_number=data.get("room_number", ""),
            max_capacity=data.get("max_capacity", 30),
            current_occupancy=data.get("current_occupancy", 0),
            is_available=data.get("is_available", True),
            equipment_status=data.get("equipment_status", ""),
        )
        print(f"DEBUG: Lab created successfully: {lab.name}")
        return JsonResponse({
            "lab": {
                "id": lab.id,
                "name": lab.name,
                "building": lab.building,
                "room_number": lab.room_number,
                "max_capacity": lab.max_capacity,
                "current_occupancy": lab.current_occupancy,
                "is_available": lab.is_available,
                "equipment_status": lab.equipment_status,
            },
            "message": "Lab created successfully"
        })
    except Exception as e:
        import traceback
        print(f"Error creating lab: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def update_lab(request, lab_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    
    try:
        try:
            lab = LabStatus.objects.get(id=lab_id)
        except LabStatus.DoesNotExist:
            return JsonResponse({"message": "Lab not found"}, status=404)
        
        data = json.loads(request.body)
        
        # Managers and admins can update directly
        if prof.role in ["manager", "admin"]:
            if "name" in data:
                lab.name = data["name"]
            if "building" in data:
                lab.building = data["building"]
            if "room_number" in data:
                lab.room_number = data["room_number"]
            if "max_capacity" in data:
                lab.max_capacity = data["max_capacity"]
            if "current_occupancy" in data:
                lab.current_occupancy = data["current_occupancy"]
            if "is_available" in data:
                lab.is_available = data["is_available"]
            if "equipment_status" in data:
                lab.equipment_status = data["equipment_status"]
            lab.save()
            return JsonResponse({
                "lab": {
                    "id": lab.id,
                    "name": lab.name,
                    "building": lab.building,
                    "room_number": lab.room_number,
                    "max_capacity": lab.max_capacity,
                    "current_occupancy": lab.current_occupancy,
                    "is_available": lab.is_available,
                    "equipment_status": lab.equipment_status,
                },
                "status": "updated",
                "message": "Lab updated successfully"
            })
        else:
            # Students/lecturers create update requests
            LabUpdateRequest.objects.create(
                lab=lab,
                requested_by=user,
                requested_current_occupancy=data.get("current_occupancy", lab.current_occupancy),
                requested_is_available=data.get("is_available", lab.is_available),
            )
            return JsonResponse({
                "status": "pending",
                "message": "Update request submitted. Waiting for manager approval."
            })
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Classroom endpoints
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_classrooms(request):
    classrooms = ClassroomStatus.objects.all().order_by("building", "name")
    return JsonResponse({
        "classrooms": [{
            "id": cls.id,
            "name": cls.name,
            "building": cls.building,
            "room_number": cls.room_number,
            "max_capacity": cls.max_capacity,
            "current_occupancy": cls.current_occupancy,
            "is_available": cls.is_available,
        } for cls in classrooms]
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_classroom(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can create classrooms"}, status=403)
    
    try:
        data = json.loads(request.body)
        cls = ClassroomStatus.objects.create(
            name=data.get("name"),
            building=data.get("building", ""),
            room_number=data.get("room_number", ""),
            max_capacity=data.get("max_capacity", 50),
            current_occupancy=data.get("current_occupancy", 0),
            is_available=data.get("is_available", True),
        )
        return JsonResponse({
            "classroom": {
                "id": cls.id,
                "name": cls.name,
                "building": cls.building,
                "room_number": cls.room_number,
                "max_capacity": cls.max_capacity,
                "current_occupancy": cls.current_occupancy,
                "is_available": cls.is_available,
            },
            "message": "Classroom created successfully"
        })
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def update_classroom(request, classroom_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can update classrooms"}, status=403)
    
    try:
        try:
            cls = ClassroomStatus.objects.get(id=classroom_id)
        except ClassroomStatus.DoesNotExist:
            return JsonResponse({"message": "Classroom not found"}, status=404)
        
        data = json.loads(request.body)
        if "name" in data:
            cls.name = data["name"]
        if "building" in data:
            cls.building = data["building"]
        if "room_number" in data:
            cls.room_number = data["room_number"]
        if "max_capacity" in data:
            cls.max_capacity = data["max_capacity"]
        if "current_occupancy" in data:
            cls.current_occupancy = data["current_occupancy"]
        if "is_available" in data:
            cls.is_available = data["is_available"]
        cls.save()
        
        return JsonResponse({
            "classroom": {
                "id": cls.id,
                "name": cls.name,
                "building": cls.building,
                "room_number": cls.room_number,
                "max_capacity": cls.max_capacity,
                "current_occupancy": cls.current_occupancy,
                "is_available": cls.is_available,
            },
            "message": "Classroom updated successfully"
        })
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Update request endpoints
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_pending_updates(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can view pending updates"}, status=403)
    
    library_requests = LibraryUpdateRequest.objects.filter(status="pending").order_by("-created_at")
    lab_requests = LabUpdateRequest.objects.filter(status="pending").order_by("-created_at")
    
    return JsonResponse({
        "library_requests": [{
            "id": req.id,
            "library_id": req.library.id if req.library else None,
            "library_name": req.library.name if req.library else req.requested_name,
            "requested_by": req.requested_by.email,
            "requested_current_occupancy": req.requested_current_occupancy,
            "requested_is_open": req.requested_is_open,
            "requested_name": req.requested_name,
            "requested_max_capacity": req.requested_max_capacity,
            "created_at": req.created_at.isoformat(),
        } for req in library_requests],
        "lab_requests": [{
            "id": req.id,
            "lab_id": req.lab.id,
            "lab_name": req.lab.name,
            "requested_by": req.requested_by.email,
            "requested_current_occupancy": req.requested_current_occupancy,
            "requested_is_available": req.requested_is_available,
            "created_at": req.created_at.isoformat(),
        } for req in lab_requests],
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def approve_library_update(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can approve updates"}, status=403)
    
    try:
        req = LibraryUpdateRequest.objects.get(id=request_id, status="pending")
        if req.library:
            lib = req.library
            lib.current_occupancy = req.requested_current_occupancy
            lib.is_open = req.requested_is_open
            if req.requested_name:
                lib.name = req.requested_name
            if req.requested_max_capacity:
                lib.max_capacity = req.requested_max_capacity
            lib.save()
        else:
            # Create new library
            lib = LibraryStatus.objects.create(
                name=req.requested_name or "New Library",
                max_capacity=req.requested_max_capacity or 100,
                current_occupancy=req.requested_current_occupancy,
                is_open=req.requested_is_open,
            )
        
        req.status = "approved"
        req.approved_by = user
        req.save()
        
        return JsonResponse({"message": "Library update approved"})
    except LibraryUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def reject_library_update(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can reject updates"}, status=403)
    
    try:
        data = json.loads(request.body)
        req = LibraryUpdateRequest.objects.get(id=request_id, status="pending")
        req.status = "rejected"
        req.approved_by = user
        req.rejection_reason = data.get("rejection_reason", "")
        req.save()
        return JsonResponse({"message": "Library update rejected"})
    except LibraryUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def approve_lab_update(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can approve updates"}, status=403)
    
    try:
        req = LabUpdateRequest.objects.get(id=request_id, status="pending")
        lab = req.lab
        lab.current_occupancy = req.requested_current_occupancy
        lab.is_available = req.requested_is_available
        lab.save()
        
        req.status = "approved"
        req.approved_by = user
        req.save()
        
        return JsonResponse({"message": "Lab update approved"})
    except LabUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def reject_lab_update(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can reject updates"}, status=403)
    
    try:
        data = json.loads(request.body)
        req = LabUpdateRequest.objects.get(id=request_id, status="pending")
        req.status = "rejected"
        req.approved_by = user
        req.rejection_reason = data.get("rejection_reason", "")
        req.save()
        return JsonResponse({"message": "Lab update rejected"})
    except LabUpdateRequest.DoesNotExist:
        return JsonResponse({"message": "Update request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Room request endpoints
@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_room_request(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["lecturer", "student"]:
        return JsonResponse({"message": "Only lecturers and students can create room requests"}, status=403)
    
    try:
        data = json.loads(request.body)
        room_type = data.get("room_type")
        room_id = data.get("room_id")
        
        requested_date = datetime.fromisoformat(data["requested_date"].replace("Z", "+00:00")).date() if "requested_date" in data else date.today()
        start_time = time.fromisoformat(data["start_time"]) if "start_time" in data else time(9, 0)
        end_time = time.fromisoformat(data["end_time"]) if "end_time" in data else time(10, 0)
        
        room_req = RoomRequest.objects.create(
            requested_by=user,
            room_type=room_type,
            classroom_id=room_id if room_type == "classroom" and room_id else None,
            lab_id=room_id if room_type == "lab" and room_id else None,
            purpose=data.get("purpose", ""),
            expected_attendees=data.get("expected_attendees", 1),
            requested_date=requested_date,
            start_time=start_time,
            end_time=end_time,
        )
        
        # Notify managers and admins
        managers = User.objects.filter(profile__role__in=["manager", "admin"])
        for m in managers:
            Notification.objects.create(
                user=m,
                title="New Room Request",
                message=f"{user.email} requested a {room_type} for {requested_date}.",
                action_link="/request-approvals"
            )
            
        return JsonResponse({
            "request": {
                "id": room_req.id,
                "room_type": room_req.room_type,
                "purpose": room_req.purpose,
                "status": room_req.status,
            },
            "message": "Room request created successfully"
        })
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_room_requests(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    
    if prof.role in ["manager", "admin"]:
        requests = RoomRequest.objects.all().order_by("-created_at")
    else:
        requests = RoomRequest.objects.filter(requested_by=user).order_by("-created_at")
    
    return JsonResponse({
        "requests": [{
            "id": req.id,
            "requested_by": req.requested_by.email,
            "requested_by_name": f"{req.requested_by.first_name} {req.requested_by.last_name}".strip() or req.requested_by.username,
            "room_type": req.room_type,
            "classroom_id": req.classroom.id if req.classroom else None,
            "classroom_name": req.classroom.name if req.classroom else None,
            "lab_id": req.lab.id if req.lab else None,
            "lab_name": req.lab.name if req.lab else None,
            "purpose": req.purpose,
            "expected_attendees": req.expected_attendees,
            "requested_date": req.requested_date.isoformat(),
            "start_time": req.start_time.isoformat(),
            "end_time": req.end_time.isoformat(),
            "status": req.status,
            "approved_by": req.approved_by.email if req.approved_by else None,
            "created_at": req.created_at.isoformat(),
            # Add assigned room details for easier frontend access
            "assigned_room": {
                "name": req.classroom.name if req.classroom else (req.lab.name if req.lab else None),
                "building": req.classroom.building if req.classroom else (req.lab.building if req.lab else None),
                "room_number": req.classroom.room_number if req.classroom else (req.lab.room_number if req.lab else None),
            } if (req.classroom or req.lab) else None
        } for req in requests]
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def approve_room_request(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can approve room requests"}, status=403)
    
    try:
        data = json.loads(request.body)
        room_id = data.get("room_id")
        
        req = RoomRequest.objects.get(id=request_id, status="pending")
        
        if room_id:
            if req.room_type == "classroom":
                req.classroom = ClassroomStatus.objects.get(id=room_id)
                req.classroom.is_available = False
                req.classroom.save()
            elif req.room_type == "lab":
                req.lab = LabStatus.objects.get(id=room_id)
                req.lab.is_available = False
                req.lab.save()
        
        req.status = "approved"
        req.approved_by = user
        req.approved_at = datetime.now()
        req.save()
        
        # Create notification
        Notification.objects.create(
            user=req.requested_by,
            title="Room Request Approved",
            message=f"Your request for {req.room_type} on {req.requested_date} has been approved.",
            action_link="/room-requests"
        )
        
        return JsonResponse({"message": "Room request approved"})
    except RoomRequest.DoesNotExist:
        return JsonResponse({"message": "Request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def reject_room_request(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can reject room requests"}, status=403)
    
    try:
        data = json.loads(request.body)
        req = RoomRequest.objects.get(id=request_id, status="pending")
        req.status = "rejected"
        req.approved_by = user
        req.rejection_reason = data.get("rejection_reason", "")
        req.save()
        
        # Create notification
        Notification.objects.create(
            user=req.requested_by,
            title="Room Request Rejected",
            message=f"Your request for {req.room_type} on {req.requested_date} was rejected: {req.rejection_reason}",
            action_link="/room-requests"
        )
        
        return JsonResponse({"message": "Room request rejected"})
    except RoomRequest.DoesNotExist:
        return JsonResponse({"message": "Request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Fault report endpoints
@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_fault(request):
    try:
        user = request.user_obj
        data = json.loads(request.body)
        
        # Construct location string if not provided but building/room are
        building = data.get("building", "")
        room_number = data.get("room_number", "")
        location = data.get("location", "")
        if not location and (building or room_number):
            location = f"{building} {room_number}".strip()

        fault = FaultReport.objects.create(
            reported_by=user,
            title=data.get("title", ""),
            description=data.get("description", ""),
            location=location, 
            building=building,
            room_number=room_number,
            severity=data.get("severity", "medium"),
            category=data.get("category", "other"),
            status="open",
        )
        
        # Notify managers and admins
        managers = User.objects.filter(profile__role__in=["manager", "admin"])
        for m in managers:
            Notification.objects.create(
                user=m,
                title="New Fault Reported",
                message=f"{fault.title} in {fault.building} {fault.room_number}",
                action_link="/fault-management"
            )

        return JsonResponse({
            "fault": {
                "id": fault.id,
                "title": fault.title,
                "status": fault.status,
            },
            "message": "Fault report created successfully"
        })
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_faults(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    
    if prof.role in ["manager", "admin"]:
        faults = FaultReport.objects.all().order_by("-created_at")
    else:
        faults = FaultReport.objects.filter(reported_by=user).order_by("-created_at")
    
    return JsonResponse({
        "faults": [{
            "id": fault.id,
            "title": fault.title,
            "description": fault.description,
            "location": fault.location,
            "building": fault.building,
            "room_number": fault.room_number,
            "severity": fault.severity,
            "category": fault.category,
            "status": fault.status,
            "assigned_to": fault.assigned_to,
            "reported_by": fault.reported_by.email,
            "reporter_email": fault.reported_by.email,  # For compatibility
            "created_at": fault.created_at.isoformat(),
            "created_date": fault.created_at.isoformat(),  # For compatibility
            "updated_at": fault.updated_at.isoformat() if fault.updated_at else None,
        } for fault in faults]
    })

@csrf_exempt
@require_http_methods(["POST", "PUT"])
@require_auth
def update_fault(request, fault_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can update faults"}, status=403)
    
    try:
        fault = FaultReport.objects.get(id=fault_id)
        data = json.loads(request.body)
        
        if "status" in data:
            fault.status = data["status"]
        if "assigned_to" in data:
            fault.assigned_to = data["assigned_to"]
        if "severity" in data:
            fault.severity = data["severity"]
        if "category" in data:
            fault.category = data["category"]
        
        fault.save()
        
        # Notify the reporter
        Notification.objects.create(
            user=fault.reported_by,
            title="Fault Report Update",
            message=f"The status of your report '{fault.title}' has been updated to {fault.status}.",
            action_link="/reports"
        )
        
        return JsonResponse({
            "fault": {
                "id": fault.id,
                "status": fault.status,
                "assigned_to": fault.assigned_to,
            },
            "message": "Fault updated successfully"
        })
    except FaultReport.DoesNotExist:
        return JsonResponse({"message": "Fault not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

# Admin endpoints
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def admin_users(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Only admins can view all users"}, status=403)
    
    users = User.objects.all().order_by("email")
    return JsonResponse({
        "users": [{
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "role": Profile.objects.get(user=u).role if Profile.objects.filter(user=u).exists() else "student",
            "department": Profile.objects.get(user=u).department if Profile.objects.filter(user=u).exists() and Profile.objects.get(user=u).department else "",
            "manager_type": Profile.objects.get(user=u).manager_type if Profile.objects.filter(user=u).exists() else None,
            "date_joined": u.date_joined.isoformat() if u.date_joined else None,
        } for u in users]
    })

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def admin_stats(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role != "admin":
        return JsonResponse({"message": "Only admins can view stats"}, status=403)
    
    # Count users by role
    all_profiles = Profile.objects.all()
    students_count = all_profiles.filter(role="student").count()
    lecturers_count = all_profiles.filter(role="lecturer").count()
    managers_count = all_profiles.filter(role="manager").count()
    admins_count = all_profiles.filter(role="admin").count()
    total_users_count = User.objects.count()
    
    # Count faults
    all_faults = FaultReport.objects.all()
    open_faults = all_faults.filter(status__in=["open", "in_progress"]).count()
    total_faults = all_faults.count()
    
    # Count pending role requests
    pending_role_requests = RoleRequest.objects.filter(status="pending").count()
    
    return JsonResponse({
        "users": {
            "total": total_users_count,
            "students": students_count,
            "lecturers": lecturers_count,
            "managers": managers_count,
            "admins": admins_count,
        },
        "faults": {
            "total": total_faults,
            "open": open_faults,
        },
        "pending_role_requests": pending_role_requests,
    })

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def admin_role_requests(request):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["admin", "manager"]:
        return JsonResponse({"message": "Only admins and managers can view role requests"}, status=403)
    
    # Get all role requests, not just pending
    requests = RoleRequest.objects.all().order_by("-created_at")
    return JsonResponse({
        "requests": [{
            "id": req.id,
            "user_email": req.user.email,
            "requested_role": req.requested_role,
            "reason": req.reason or "",
            "status": req.status,
            "manager_type": Profile.objects.get(user=req.user).manager_type if Profile.objects.filter(user=req.user).exists() else None,  # Get manager_type from Profile
            "rejection_reason": getattr(req, 'rejection_reason', None) or None,
            "requested_at": req.created_at.isoformat() if hasattr(req, 'created_at') and req.created_at else None,
            "approved_at": getattr(req, 'approved_at', None).isoformat() if hasattr(req, 'approved_at') and getattr(req, 'approved_at', None) else None,
            "approved_by": getattr(req, 'approved_by', None).email if hasattr(req, 'approved_by') and getattr(req, 'approved_by') else None,
        } for req in requests]
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def admin_approve_role(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["admin", "manager"]:
        return JsonResponse({"message": "Only admins and managers can approve roles"}, status=403)
    
    try:
        req = RoleRequest.objects.get(id=request_id, status="pending")
        user_prof, _ = Profile.objects.get_or_create(user=req.user)
        
        # Update the role
        user_prof.role = req.requested_role
        
        # Manager type should already be saved in profile from when the request was created
        # But verify it's there for manager role
        if req.requested_role == "manager" and not user_prof.manager_type:
            print(f"WARNING: Manager role approved but manager_type is not set for {req.user.email}")
        
        user_prof.save()
        
        # Update request status
        req.status = "approved"
        # Try to set approved_by if the field exists
        try:
            req.approved_by = user
            req.approved_at = datetime.now()
        except:
            pass
        req.save()
        
        # Create notification
        try:
            Notification.objects.create(
                user=req.user,
                title="Role Request Approved",
                message=f"Your request for the {req.requested_role} role has been approved.",
                action_link="/dashboard"
            )
        except Exception as e:
            print(f"Error creating notification: {e}")

        req.save()
        
        req.save()
        
        if user_prof.manager_type:
             pass # Removed debug print

        
        return JsonResponse({
            "message": "Role approved",
            "user": _user_to_dict(req.user)
        })
    except RoleRequest.DoesNotExist:
        return JsonResponse({"message": "Request not found"}, status=404)
    except Exception as e:
        import traceback
        print(f"Error approving role: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def admin_reject_role(request, request_id):
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["admin", "manager"]:
        return JsonResponse({"message": "Only admins and managers can reject roles"}, status=403)
    
    try:
        req = RoleRequest.objects.get(id=request_id, status="pending")
        req.status = "rejected"
        req.save()
        
        # Create notification
        Notification.objects.create(
            user=req.user,
            title="Role Request Rejected",
            message=f"Your request for the {req.requested_role} role was rejected. Please contact an administrator.",
            action_link="/role-select"
        )
        return JsonResponse({"message": "Role rejected"})
    except RoleRequest.DoesNotExist:
        return JsonResponse({"message": "Request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def get_recurring_issues(request):
    """US-11: Recurring Problems report"""
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Only managers and admins can view recurring issues"}, status=403)
    
    # Identify Recurring Fault Patterns (US-11.1)
    # Group by building, room_number, and title or category
    recurring_faults = FaultReport.objects.values(
        'building', 'room_number', 'category'
    ).annotate(
        count=Count('id')
    ).filter(count__gte=2).order_by('-count')
    
    # Identify Recurring Overload Patterns (US-11.2)
    recurring_overloads = OverloadRecord.objects.values(
        'building', 'room_number', 'resource_type'
    ).annotate(
        count=Count('id')
    ).filter(count__gte=2).order_by('-count')
    
    return JsonResponse({
        "recurring_faults": list(recurring_faults),
        "recurring_overloads": list(recurring_overloads),
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def log_overload(request):
    """Internal/Manager endpoint to log an overload event"""
    user = request.user_obj
    prof, _ = Profile.objects.get_or_create(user=user)
    if prof.role not in ["manager", "admin"]:
        return JsonResponse({"message": "Unauthorized"}, status=403)
    
    try:
        data = json.loads(request.body)
        overload = OverloadRecord.objects.create(
            resource_type=data.get("resource_type", "occupancy"),
            location=data.get("location", ""),
            building=data.get("building", ""),
            room_number=data.get("room_number", ""),
            description=data.get("description", ""),
            threshold_value=data.get("threshold_value", 0.0),
            current_value=data.get("current_value", 0.0),
        )
        return JsonResponse({"message": "Overload logged", "id": overload.id})
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

# Notification endpoints
@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def list_notifications(request):
    user = request.user_obj
    
    # Get unread notifications first, then read ones, limited to 50 recent
    notifications = Notification.objects.filter(user=user).order_by("is_read", "-created_at")[:50]
    
    return JsonResponse({
        "notifications": [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "action_link": n.action_link,
            "created_at": n.created_at.isoformat(),
        } for n in notifications],
        "unread_count": Notification.objects.filter(user=user, is_read=False).count()
    })

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_notification_read(request, notification_id):
    user = request.user_obj
    try:
        notification = Notification.objects.get(id=notification_id, user=user)
        notification.is_read = True
        notification.save()
        return JsonResponse({"message": "Notification marked as read"})
    except Notification.DoesNotExist:
        return JsonResponse({"message": "Notification not found"}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_all_notifications_read(request):
    user = request.user_obj
    Notification.objects.filter(user=user, is_read=False).update(is_read=True)
    return JsonResponse({"message": "All notifications marked as read"})
