from rest_framework.permissions import BasePermission
from .models import Suscripcion

class EsSuscriptorActivo(BasePermission):
    message = "Necesitas una suscripción activa para acceder."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        sus = (
            Suscripcion.objects
            .filter(usuario=user, estado="activa")
            .order_by("-fecha_inicio")
            .first()
        )
        return bool(sus and sus.esta_activa())
