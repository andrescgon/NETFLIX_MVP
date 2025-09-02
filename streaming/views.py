# streaming/views.py
import time
import hmac
import hashlib

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from subscriptions.permissions import EsSuscriptorActivo
from uploader.models import MediaAsset
from content.models import Pelicula
from profiles.models import Perfil

# 👇 importa tu modelo mapeado a public.historial
from history.models import Historial


# =========================
# Helpers para firmar URLs
# =========================
def _sign_download(asset_id: int, exp_ts: int) -> str:
    msg = f"{asset_id}:{exp_ts}".encode()
    key = settings.SECRET_KEY.encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def _verify_download(asset_id: int, exp_ts: int, token: str) -> bool:
    try:
        exp_ts = int(exp_ts)
    except (TypeError, ValueError):
        return False
    if exp_ts < int(time.time()):
        return False
    expected = _sign_download(asset_id, exp_ts)
    return hmac.compare_digest(expected, token)


def _get_or_create_historial_hoy(perfil_id: int, pelicula_id: int) -> Historial:
    """Upsert por día (perfil + película + fecha)."""
    hoy = timezone.localdate()
    h = (Historial.objects
         .filter(id_perfil=perfil_id, id_pelicula=pelicula_id, fecha_vista__date=hoy)
         .first())
    if h:
        return h
    h = Historial(id_perfil=perfil_id, id_pelicula=pelicula_id)
    h.save(force_insert=True)
    return h


class PlayPeliculaView(APIView):
    """
    Devuelve una URL firmada y temporal para reproducir la película.
    Además: CREA/ACTUALIZA automáticamente el historial del día.
    Requiere: usuario autenticado + suscripción activa + perfil válido.

    Query params:
      - perfil (obligatorio): id del perfil que reproduce
      - calidad (opcional): '1080p' | '720p' | '480p' | '360p'
      - trailer=true/false (opcional)
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]
    PREFERRED = ("1080p", "720p", "480p", "360p")

    def get(self, request, pelicula_id: int):
        # 1) Película existente
        get_object_or_404(Pelicula, pk=pelicula_id)

        # 2) Perfil obligatorio y debe pertenecer al usuario
        perfil_id = request.query_params.get("perfil")
        if not perfil_id:
            return Response({"detail": "Debes indicar ?perfil=<id_perfil>."}, status=400)
        get_object_or_404(Perfil, pk=perfil_id, usuario_id=request.user.id_usuario)

        # 3) Seleccionar asset
        calidad = request.query_params.get("calidad")
        trailer_q = request.query_params.get("trailer")
        es_trailer = None
        if trailer_q is not None:
            es_trailer = trailer_q.lower() in ("1", "true", "t", "yes", "si")

        qs = MediaAsset.objects.filter(pelicula_id=pelicula_id)
        if es_trailer is not None:
            qs = qs.filter(es_trailer=es_trailer)

        asset = None
        if calidad:
            asset = qs.filter(calidad__iexact=calidad).order_by("-creado_en").first()
        else:
            for c in self.PREFERRED:
                asset = qs.filter(calidad__iexact=c).order_by("-creado_en").first()
                if asset:
                    break
            if not asset:
                asset = qs.order_by("-creado_en").first()

        if not asset:
            raise Http404("No hay media para esta película.")

        # 4) === HISTORIAL: crea/actualiza automáticamente el registro del día ===
        historial = _get_or_create_historial_hoy(int(perfil_id), int(pelicula_id))
        # (Opcional) Si quieres resetear "terminado" cuando vuelve a reproducir:
        # if historial.terminado:
        #     historial.terminado = False
        #     historial.save(update_fields=["terminado"])

        # 5) Generar URL firmada (15 minutos)
        exp = int(time.time()) + 15 * 60
        token = _sign_download(asset.id, exp)

        file_path = reverse("stream-file", args=[asset.id, token])
        stream_url = request.build_absolute_uri(f"{file_path}?exp={exp}&perfil={perfil_id}")

        return Response({
            "pelicula_id": pelicula_id,
            "asset_id": asset.id,
            "historial_id": historial.id_historial,  # 👈 devuelve el historial creado/actualizado
            "url": stream_url,
            "calidad": asset.calidad,
            "mime_type": asset.mime_type,
            "es_trailer": asset.es_trailer,
            "expires_at": exp,
        })


class ListStreamsView(APIView):
    """
    Lista todas las variantes disponibles para una película.
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def get(self, request, pelicula_id: int):
        get_object_or_404(Pelicula, pk=pelicula_id)
        assets = (MediaAsset.objects
                  .filter(pelicula_id=pelicula_id)
                  .order_by("es_trailer", "calidad", "-creado_en"))

        data = []
        for a in assets:
            source = a.remote_url or (a.archivo.url if a.archivo else None)
            if not source:
                continue
            data.append({
                "asset_id": a.id,
                "origen": "remote" if a.remote_url else "local",
                "ruta": source,
                "calidad": a.calidad,
                "mime_type": a.mime_type,
                "es_trailer": a.es_trailer,
                "creado_en": a.creado_en,
            })
        return Response({"pelicula_id": pelicula_id, "assets": data})


class StreamFileView(APIView):
    """
    Sirve el archivo local protegido por token + expiración y perfil válido.
    Requiere: usuario autenticado + suscripción activa.
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def get(self, request, asset_id: int, token: str):
        exp = request.query_params.get("exp")
        perfil_id = request.query_params.get("perfil")

        if not exp or not perfil_id:
            raise Http404("Parámetros inválidos.")

        if not _verify_download(asset_id, exp, token):
            raise Http404("Link vencido o inválido.")

        get_object_or_404(Perfil, pk=perfil_id, usuario_id=request.user.id_usuario)

        asset = get_object_or_404(MediaAsset, pk=asset_id)

        if asset.remote_url:
            return HttpResponseRedirect(asset.remote_url)

        if not asset.archivo:
            raise Http404("Archivo no disponible.")

        return FileResponse(
            asset.archivo.open('rb'),
            content_type=asset.mime_type or 'application/octet-stream'
        )
