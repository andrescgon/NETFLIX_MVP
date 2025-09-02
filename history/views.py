from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from subscriptions.permissions import EsSuscriptorActivo
from profiles.models import Perfil
from content.models import Pelicula
from .models import Historial
from .serializers import HistorialSerializer


def _perfil_del_usuario_o_404(user, perfil_id: int) -> Perfil:
    """
    Asegura que el perfil indicado pertenece al usuario autenticado.
    """
    return get_object_or_404(Perfil, pk=perfil_id, usuario_id=user.id_usuario)


def _get_or_create_historial_hoy(perfil_id: int, pelicula_id: int) -> Historial:
    """
    Retorna el registro de hoy (por id_perfil + id_pelicula + fecha_vista::date).
    Si no existe, lo crea.
    """
    hoy = timezone.localdate()  # fecha sin hora (tz-aware)
    h = (Historial.objects
         .filter(id_perfil=perfil_id, id_pelicula=pelicula_id, fecha_vista__date=hoy)
         .first())
    if h:
        return h
    # crea uno nuevo
    h = Historial(id_perfil=perfil_id, id_pelicula=pelicula_id)
    # fecha_vista usa auto_now_add; al salvar quedará ahora()
    h.save(force_insert=True)
    return h


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

        # valida que el perfil es del usuario
        _perfil_del_usuario_o_404(request.user, int(perfil_id))
        # valida que la película existe (por si acaso)
        get_object_or_404(Pelicula, pk=int(pelicula_id))

        h = _get_or_create_historial_hoy(int(perfil_id), int(pelicula_id))

        # si te interesa guardar una duración objetivo, puedes reutilizar progreso_segundos
        # o crear una columna aparte. Aquí no modificamos nada extra.
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

        # Seguridad suave: comprobamos que el perfil del historial pertenece al usuario
        _perfil_del_usuario_o_404(request.user, h.id_perfil)

        # actualiza solo si la nueva posición es mayor
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

        h.terminado = True
        h.save(update_fields=['progreso_segundos', 'terminado'])
        return Response({"ok": True})


class RecentHistoryView(APIView):
    """
    Lista historial reciente para un perfil.
    GET params: ?perfil=<id>&limit=20
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def get(self, request):
        perfil_id = request.query_params.get('perfil')
        limit = int(request.query_params.get('limit') or 20)

        if not perfil_id:
            return Response({"detail": "Debes enviar ?perfil=<id_perfil>."}, status=400)

        _perfil_del_usuario_o_404(request.user, int(perfil_id))

        qs = Historial.objects.filter(id_perfil=int(perfil_id)).order_by('-fecha_vista')[:limit]
        ser = HistorialSerializer(qs, many=True)
        return Response({"results": ser.data})
