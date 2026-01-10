# users/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Optional: only admins can see all users
    permission_classes = [IsAdminUser]
