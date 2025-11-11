from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from .models import Perfil
from .serializers import PerfilSerializer
from django.shortcuts import get_object_or_404

COOKIE_NAME = "perfil_activo"
COOKIE_SALT = "perfil.activo.v1"

class PerfilViewSet(viewsets.ModelViewSet):
    serializer_class = PerfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Perfil.objects.filter(usuario=self.request.user).order_by('id_perfil')

    def perform_destroy(self, instance):
        if self.get_queryset().count() <= 1:
            raise ValidationError("Debes tener al menos un perfil.")
        if getattr(instance, "es_admin", False):
            raise ValidationError("No puedes eliminar el perfil administrador.")
        instance.delete()


@method_decorator(csrf_exempt, name='dispatch')
class ActivarPerfilView(APIView):
    """
    POST /api/perfiles/<perfil_id>/activar/
    -> fija cookie firmada 'perfil_activo' con el id del perfil del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, perfil_id: int):
        perfil = get_object_or_404(Perfil, pk=perfil_id, usuario=request.user)

        resp = Response({"ok": True, "perfil_activo": perfil.id_perfil})
        resp.set_signed_cookie(
            key=COOKIE_NAME,
            value=str(perfil.id_perfil),
            salt=COOKIE_SALT,
            max_age=30*24*3600,  # 30 días
            httponly=True,
            samesite="Lax",
            secure=False,        # True si usas HTTPS
            path="/",
        )
        return resp
    
class VerPerfilActivoView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        perfil_id = request.get_signed_cookie("perfil_activo", default=None, salt="perfil-activo")
        return Response({"perfil_activo": int(perfil_id) if perfil_id else None})
    
class DesactivarPerfilView(APIView):
    """
    POST /api/perfiles/desactivar/ -> elimina la cookie de perfil activo
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resp = Response({"ok": True, "perfil_activo": None})
        resp.delete_cookie(COOKIE_NAME, path="/")
        return resp