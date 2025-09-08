# history/views.py
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


# === Config de cookie de perfil activo (debe coincidir con profiles/views.py) ===
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


# ---------------------- Vistas ----------------------
class StartHistoryView(APIView):
    """
    Crea/actualiza el historial del día cuando el usuario inicia la reproducción.
    POST body: { "perfil_id": int, "pelicula_id": int, "duration": (opcional, segundos) }
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def post(self, request):
        perfil_id = request.data.get('perfil_id')
        pelicula_id = request.data.get('pelicula_id')

        if not perfil_id or not pelicula_id:
            return Response({"detail": "perfil_id y pelicula_id son obligatorios."}, status=400)

        _perfil_del_usuario_o_404(request.user, int(perfil_id))
        get_object_or_404(Pelicula, pk=int(pelicula_id))

        h = _get_or_create_historial_hoy(int(perfil_id), int(pelicula_id))
        ser = HistorialSerializer(h)
        return Response({"historial": ser.data})


class PingHistoryView(APIView):
    """
    Guarda progreso periódico durante la reproducción.
    POST body: { "historial_id": int, "position": int }  (position en segundos)
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def post(self, request):
        historial_id = request.data.get('historial_id')
        position = request.data.get('position')

        if historial_id is None or position is None:
            return Response({"detail": "historial_id y position son obligatorios."}, status=400)

        h = get_object_or_404(Historial, pk=int(historial_id))
        _perfil_del_usuario_o_404(request.user, h.id_perfil)

        position = int(position)
        if position > (h.progreso_segundos or 0):
            h.progreso_segundos = position
            h.save(update_fields=['progreso_segundos'])

        return Response({"ok": True, "progreso_segundos": h.progreso_segundos})


class FinishHistoryView(APIView):
    """
    Marca el historial como terminado.
    POST body: { "historial_id": int, "position": (opcional, int) }
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def post(self, request):
        historial_id = request.data.get('historial_id')
        position = request.data.get('position')

        if historial_id is None:
            return Response({"detail": "historial_id es obligatorio."}, status=400)

        h = get_object_or_404(Historial, pk=int(historial_id))
        _perfil_del_usuario_o_404(request.user, h.id_perfil)

        if position is not None:
            position = int(position)
            if position > (h.progreso_segundos or 0):
                h.progreso_segundos = position

        # si existen las columnas, se actualizan; de lo contrario, no pasa nada
        if hasattr(h, "terminado"):
            h.terminado = True
            h.save(update_fields=['progreso_segundos', 'terminado'])
        else:
            h.save(update_fields=['progreso_segundos'])

        return Response({"ok": True})


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

        # ---- Mapear id_pelicula -> título (evitar N+1) ----
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
                # ocultamos progreso/terminado en la respuesta pública
                # "progreso_segundos": getattr(h, "progreso_segundos", None),
                # "terminado": getattr(h, "terminado", None),
            })

        return Response({
            "perfil": perfil.id_perfil,
            "count": len(items),
            "items": items,
        })
