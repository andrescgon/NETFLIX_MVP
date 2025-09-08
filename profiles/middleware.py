from django.utils.deprecation import MiddlewareMixin
from django.core import signing
from django.shortcuts import get_object_or_404
from profiles.models import Perfil

COOKIE_NAME = "perfil_activo"
COOKIE_SALT = "perfil-cookie-salt"

class PerfilActivoMiddleware(MiddlewareMixin):
    """
    Si el usuario está autenticado (JWT) y viene la cookie firmada 'perfil_activo',
    valida que el perfil pertenezca al usuario y lo adjunta como request.perfil_activo (obj Perfil).
    """
    def process_request(self, request):
        request.perfil_activo = None

        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return

        raw = request.COOKIES.get(COOKIE_NAME)
        if not raw:
            return

        try:
            perfil_id = signing.Signer(salt=COOKIE_SALT).unsign(raw)
            # valida que sea del usuario
            perfil = get_object_or_404(Perfil, pk=int(perfil_id), usuario_id=user.id_usuario)
            request.perfil_activo = perfil
        except Exception:
            # cookie inválida o perfil ya no existe / no pertenece al usuario
            request.perfil_activo = None
