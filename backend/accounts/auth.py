from django.http import JsonResponse
from django.contrib.auth.models import User
from .jwt import decode_token

def get_user_from_request(request):
    # Try multiple ways to get the Authorization header
    # Django converts headers to HTTP_* format in META, and Authorization becomes HTTP_AUTHORIZATION
    auth = None
    
    # Try request.headers first (Django 2.2+)
    if hasattr(request, 'headers'):
        auth = request.headers.get("Authorization", "") or request.headers.get("authorization", "")
    
    # Fallback to META (works in all Django versions)
    if not auth:
        auth = request.META.get("HTTP_AUTHORIZATION", "") or request.META.get("HTTP_AUTHORIZATION", "")
    
    # Also try the raw header
    if not auth and hasattr(request, 'META'):
        # Check all META keys for authorization
        for key in request.META:
            if key.upper().replace('-', '_') == 'HTTP_AUTHORIZATION':
                auth = request.META[key]
                break
    
    print(f"DEBUG: get_user_from_request called")
    print(f"DEBUG: Request method: {request.method}")
    if hasattr(request, 'headers'):
        print(f"DEBUG: request.headers Authorization: {request.headers.get('Authorization', 'NOT FOUND')[:50]}...")
    print(f"DEBUG: request.META HTTP_AUTHORIZATION: {request.META.get('HTTP_AUTHORIZATION', 'NOT FOUND')[:50]}...")
    print(f"DEBUG: All META keys containing 'AUTH': {[k for k in request.META.keys() if 'AUTH' in k.upper()]}")
    print(f"DEBUG: Authorization header found: {bool(auth)}")
    
    if auth:
        print(f"DEBUG: Authorization header (first 50 chars): {auth[:50]}...")
    else:
        print(f"DEBUG: No Authorization header found in any location")
        return None
    
    if not auth.startswith("Bearer "):
        print(f"DEBUG: Authorization header doesn't start with 'Bearer ': {auth[:20]}...")
        return None
    
    token = auth.replace("Bearer ", "").strip()
    if not token:
        print("DEBUG: Token is empty after removing 'Bearer '")
        return None
    
    print(f"DEBUG: Token extracted, length: {len(token)}")
    print(f"DEBUG: Token (first 30 chars): {token[:30]}...")
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            print(f"DEBUG: No 'sub' or 'user_id' in token payload: {payload}")
            return None
        
        # Ensure user_id is an integer (decode_token converts string to int, but be safe)
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            print(f"DEBUG: Invalid user_id type: {type(user_id)}, value: {user_id}")
            return None
        
        print(f"DEBUG: Extracted user_id from token: {user_id} (type: {type(user_id)})")
        user = User.objects.filter(id=user_id).first()
        if not user:
            print(f"DEBUG: User with id {user_id} not found in database")
            return None
        print(f"DEBUG: Successfully authenticated user: {user.email} (id: {user.id})")
        return user
    except ValueError as e:
        # Token expired or invalid
        print(f"DEBUG: Token validation error (ValueError): {str(e)}")
        import traceback
        traceback.print_exc()
        return None
    except Exception as e:
        # Unexpected error - log for debugging
        print(f"DEBUG: Unexpected error in get_user_from_request: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def require_auth(view_func):
    def wrapper(request, *args, **kwargs):
        # Allow OPTIONS requests through (CORS preflight)
        if request.method == "OPTIONS":
            return view_func(request, *args, **kwargs)
        
        user = get_user_from_request(request)
        if not user:
            print(f"DEBUG: require_auth failed for {view_func.__name__}")
            if hasattr(request, 'headers'):
                print(f"DEBUG: Authorization header: {request.headers.get('Authorization', 'NOT SET')[:50]}...")
            print(f"DEBUG: HTTP_AUTHORIZATION: {request.META.get('HTTP_AUTHORIZATION', 'NOT SET')[:50]}...")
            return JsonResponse({"message": "Unauthorized - Please log in again"}, status=401)
        request.user_obj = user
        print(f"DEBUG: require_auth passed for {view_func.__name__}, user: {user.email}")
        return view_func(request, *args, **kwargs)
    return wrapper
