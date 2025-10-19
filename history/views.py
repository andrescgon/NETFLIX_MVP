from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.signing import BadSignature
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics
from subscriptions.permissions import EsSuscriptorActivo
from profiles.models import Perfil
from content.models import Pelicula
from .models import Historial
from .serializers import HistorialSerializer, HistorialAdminSerializer



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


class UpdateProgressView(APIView):
    """
    POST/PUT /api/history/progress/
    Actualiza el progreso de reproducción de una película.
    Body: {
        "pelicula_id": int,
        "progreso_segundos": int,
        "terminado": bool (opcional)
    }
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def post(self, request):
        # Obtener perfil activo
        perfil_id = _perfil_id_from_cookie(request)
        if not perfil_id:
            return Response(
                {"detail": "No hay perfil activo."},
                status=400
            )

        perfil = _perfil_del_usuario_o_404(request.user, perfil_id)

        # Validar datos
        pelicula_id = request.data.get("pelicula_id")
        progreso_segundos = request.data.get("progreso_segundos")
        terminado = request.data.get("terminado", False)

        if not pelicula_id or progreso_segundos is None:
            return Response(
                {"detail": "pelicula_id y progreso_segundos son requeridos."},
                status=400
            )

        # Verificar que la película existe
        pelicula = get_object_or_404(Pelicula, pk=pelicula_id)

        # Obtener o crear historial de hoy
        historial = _get_or_create_historial_hoy(perfil.id_perfil, pelicula_id)

        # Actualizar progreso y fecha_vista (para ordenar correctamente "continuar viendo")
        historial.progreso_segundos = int(progreso_segundos)
        historial.terminado = bool(terminado)
        historial.fecha_vista = timezone.now()  # Actualizar la fecha cada vez que se guarda progreso
        historial.save()

        return Response({
            "success": True,
            "id_historial": historial.id_historial,
            "progreso_segundos": historial.progreso_segundos,
            "terminado": historial.terminado
        })


class GetProgressView(APIView):
    """
    GET /api/history/progress/<pelicula_id>/
    Obtiene el progreso guardado de una película para el perfil activo.
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def get(self, request, pelicula_id):
        # Obtener perfil activo
        perfil_id = _perfil_id_from_cookie(request)
        if not perfil_id:
            return Response(
                {"detail": "No hay perfil activo."},
                status=400
            )

        perfil = _perfil_del_usuario_o_404(request.user, perfil_id)

        # Buscar el registro más reciente para esta película y perfil
        historial = (
            Historial.objects
            .filter(id_perfil=perfil.id_perfil, id_pelicula=pelicula_id)
            .order_by('-fecha_vista')
            .first()
        )

        if not historial:
            return Response({
                "progreso_segundos": 0,
                "terminado": False
            })

        return Response({
            "progreso_segundos": historial.progreso_segundos,
            "terminado": historial.terminado,
            "fecha_vista": historial.fecha_vista
        })


class RecommendationsView(APIView):
    """
    GET /api/history/recommendations/
    Obtiene recomendaciones basadas en el historial del perfil activo.
    Busca películas similares por géneros, actores y directores.
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def get(self, request):
        # Obtener perfil activo
        perfil_id = _perfil_id_from_cookie(request)
        if not perfil_id:
            return Response(
                {"detail": "No hay perfil activo."},
                status=400
            )

        perfil = get_object_or_404(Perfil, pk=perfil_id, usuario_id=request.user.id_usuario)

        # Obtener historial reciente (últimos 30 días, max 20 películas)
        desde = timezone.now() - timedelta(days=30)
        historial = (
            Historial.objects
            .filter(id_perfil=perfil.id_perfil, fecha_vista__gte=desde)
            .order_by('-fecha_vista')[:20]
        )

        if not historial:
            return Response({
                "perfil": perfil.id_perfil,
                "recommendations": []
            })

        # Obtener IDs de películas vistas
        pelicula_ids_vistas = [h.id_pelicula for h in historial]

        # Obtener películas vistas con sus relaciones
        peliculas_vistas = Pelicula.objects.filter(id_pelicula__in=pelicula_ids_vistas).prefetch_related('generos', 'actores', 'directores')

        # Recolectar géneros, actores y directores más vistos
        generos_vistos = set()
        actores_vistos = set()
        directores_vistos = set()

        for pelicula in peliculas_vistas:
            generos_vistos.update(pelicula.generos.values_list('id_genero', flat=True))
            actores_vistos.update(pelicula.actores.values_list('id_actor', flat=True))
            directores_vistos.update(pelicula.directores.values_list('id_director', flat=True))

        # Buscar películas recomendadas (que NO haya visto)
        from django.db.models import Q, Count

        recomendaciones = (
            Pelicula.objects
            .exclude(id_pelicula__in=pelicula_ids_vistas)  # Excluir las que ya vio
            .filter(
                Q(generos__id_genero__in=generos_vistos) |
                Q(actores__id_actor__in=actores_vistos) |
                Q(directores__id_director__in=directores_vistos)
            )
            .annotate(relevancia=Count('id_pelicula'))  # Contar coincidencias
            .order_by('-relevancia')  # Más relevantes primero
            .distinct()[:20]  # Máximo 20 recomendaciones
        )

        # Serializar recomendaciones
        from content.serializers import PeliculaListaSerializer
        serializer = PeliculaListaSerializer(recomendaciones, many=True)

        return Response({
            "perfil": perfil.id_perfil,
            "recommendations": serializer.data,
            "based_on": {
                "generos": len(generos_vistos),
                "actores": len(actores_vistos),
                "directores": len(directores_vistos)
            }
        })


# ==================== VISTAS DE ADMINISTRACIÓN ====================
class AllHistoryAdminView(generics.ListAPIView):
    """Vista para obtener TODO el historial (Admin)"""
    permission_classes = [IsAdminUser]
    serializer_class = HistorialAdminSerializer

    def get_queryset(self):
        return Historial.objects.all().order_by('-fecha_vista')
