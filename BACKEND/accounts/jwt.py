import jwt
from django.conf import settings
from datetime import datetime, timedelta

def create_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    # Ensure token is a string (not bytes)
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token

def decode_token(token):
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
