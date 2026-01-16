import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

SECRET_KEY = getattr(settings, 'SECRET_KEY', 'change-me')

def encode_token(user_id):
    # Validate user_id
    if user_id is None:
        raise ValueError("user_id cannot be None")
    
    # Ensure user_id is an integer
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise ValueError(f"user_id must be an integer, got: {type(user_id)}")
    
    # Ensure SECRET_KEY is a string (not bytes)
    secret = str(SECRET_KEY) if SECRET_KEY else 'change-me'
    
    # Use timezone-aware datetime
    now = datetime.now(timezone.utc)
    
    # PyJWT requires 'sub' to be a string, so convert user_id to string
    payload = {
        'sub': str(user_id),  # Must be string for PyJWT 2.10+
        'exp': now + timedelta(days=7),
        'iat': now,
    }
    
    try:
        print(f"DEBUG: Encoding token for user_id={user_id}, SECRET_KEY type={type(secret)}")
        token = jwt.encode(payload, secret, algorithm='HS256')
        
        # PyJWT returns string in newer versions, but ensure it's a string
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        elif not isinstance(token, str):
            token = str(token)
        
        token = token.strip()  # Remove any whitespace
        
        print(f"DEBUG: Token encoded successfully for user_id {user_id}")
        print(f"DEBUG: Token type: {type(token)}, length: {len(token)}")
        print(f"DEBUG: Token (first 50 chars): {token[:50]}...")
        
        return token
    except Exception as e:
        print(f"ERROR: Failed to encode token: {type(e).__name__}: {str(e)}")
        print(f"ERROR: user_id={user_id}, user_id_type={type(user_id)}")
        print(f"ERROR: SECRET_KEY={secret[:20]}... (length: {len(secret)})")
        import traceback
        traceback.print_exc()
        raise

def decode_token(token):
    # Ensure SECRET_KEY is a string
    secret = str(SECRET_KEY) if SECRET_KEY else 'change-me'
    
    try:
        print(f"DEBUG: Decoding token (first 20 chars): {token[:20]}...")
        print(f"DEBUG: Using SECRET_KEY: {secret[:10]}...")
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        print(f"DEBUG: Token decoded successfully. Payload: {payload}")
        # Convert 'sub' back to integer for consistency
        if 'sub' in payload and isinstance(payload['sub'], str):
            try:
                payload['sub'] = int(payload['sub'])
            except (ValueError, TypeError):
                pass  # Keep as string if conversion fails
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: Token has expired")
        raise ValueError('Token has expired')
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: Invalid token error: {str(e)}")
        raise ValueError('Invalid token')
    except Exception as e:
        print(f"DEBUG: Unexpected error decoding token: {type(e).__name__}: {str(e)}")
        raise ValueError(f'Token decode error: {str(e)}')
