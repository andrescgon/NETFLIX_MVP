from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.signing import BadSignature
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from subscriptions.permissions import EsSuscriptorActivo
from profiles.models import Perfil
from content.models import Pelicula
from .models import Historial
from .serializers import HistorialSerializer



COOKIE_NAME = "perfil_activo"
COOKIE_SALT = "perfil.activo.v1"


# ---------------------- Helpers ----------------------
def _perfil_del_usuario_o_404(user, perfil_id: int) -> Perfil:
    """Asegura que el perfil indicado pertenece al usuario autenticado."""
    return get_object_or_404(Perfil, pk=perfil_id, usuario_id=user.id_usuario)


def _get_or_create_historial_hoy(perfil_id: int, pelicula_id: int) -> Historial:
    """
    Retorna el registro de hoy (por id_perfil + id_pelicula + fecha_vista::date).
    Si no existe, lo crea.
    """
    hoy = timezone.localdate()
    h = (
        Historial.objects
        .filter(id_perfil=perfil_id, id_pelicula=pelicula_id, fecha_vista__date=hoy)
        .first()
    )
    if h:
        return h
    h = Historial(id_perfil=perfil_id, id_pelicula=pelicula_id)
    h.save(force_insert=True)
    return h


def _perfil_id_from_cookie(request):
    """Devuelve el id de perfil desde cookie firmada o None si no es válida."""
    try:
        raw = request.get_signed_cookie(COOKIE_NAME, salt=COOKIE_SALT)
        return int(raw)
    except (KeyError, BadSignature, ValueError):
        return None


# ---------------------- Vistas ---------------------
class RecentHistoryView(APIView):
    """
    GET /api/history/recent/
    Lista historial reciente del **perfil activo**. Si envías ?perfil=<id>, se usa ese.
    Query params opcionales:
      - days  (por defecto 30)
      - limit (por defecto 20)
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def _resolve_perfil(self, request):
        # 1) override por query param
        pid = request.query_params.get("perfil")
        if pid:
            try:
                pid_int = int(pid)
            except ValueError:
                return None
            return get_object_or_404(Perfil, pk=pid_int, usuario_id=request.user.id_usuario)

        # 2) cookie firmada
        pid = _perfil_id_from_cookie(request)
        if not pid:
            return None
        return get_object_or_404(Perfil, pk=pid, usuario_id=request.user.id_usuario)

    def get(self, request):
        perfil = self._resolve_perfil(request)
        if not perfil:
            return Response(
                {"detail": "No hay perfil activo. Activa uno con POST /api/perfiles/<id>/activar/ o envía ?perfil=<id>."},
                status=400
            )

        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            days = 30
        try:
            limit = int(request.query_params.get("limit", 20))
        except ValueError:
            limit = 20

        desde = timezone.now() - timedelta(days=days)

        qs = (
            Historial.objects
            .filter(id_perfil=perfil.id_perfil, fecha_vista__gte=desde)
            .order_by("-fecha_vista")[:limit]
        )


        pelicula_ids = list({h.id_pelicula for h in qs})
        titulos = (
            Pelicula.objects
            .filter(id_pelicula__in=pelicula_ids)
            .values("id_pelicula", "titulo")  # 👈 solo campos existentes
        )
        titulo_map = {p["id_pelicula"]: p["titulo"] for p in titulos}

        items = []
        for h in qs:
            items.append({
                "id_historial": h.id_historial,
                "pelicula_id": h.id_pelicula,
                "pelicula_titulo": titulo_map.get(h.id_pelicula),
                "fecha_vista": h.fecha_vista,
            })

        return Response({
            "perfil": perfil.id_perfil,
            "count": len(items),
            "items": items,
        })
