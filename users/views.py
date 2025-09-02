from django.shortcuts import render

from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Registro de usuarios
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# Login con JWT (ya incluido en simplejwt)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
