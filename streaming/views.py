# streaming/views.py
import time
import hmac
import hashlib

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponseRedirect, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
import os
import re

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from subscriptions.permissions import EsSuscriptorActivo
from uploader.models import MediaAsset
from content.models import Pelicula
from profiles.models import Perfil
from history.models import Historial  # mapea a public.historial
from django.core.signing import BadSignature

COOKIE_NAME = "perfil_activo"
COOKIE_SALT = "perfil.activo.v1"

def _sign_download(asset_id: int, exp_ts: int) -> str:
    """
    Firma HMAC-SHA256 sobre "<asset_id>:<exp_ts>" con SECRET_KEY.
    """
    msg = f"{asset_id}:{exp_ts}".encode()
    key = settings.SECRET_KEY.encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def _verify_download(asset_id: int, exp_ts: int, token: str) -> bool:
    """
    Verifica expiración y la firma HMAC.
    """
    try:
        exp_ts = int(exp_ts)
    except (TypeError, ValueError):
        return False
    if exp_ts < int(time.time()):
        return False
    expected = _sign_download(asset_id, exp_ts)
    return hmac.compare_digest(expected, token)


def _get_or_create_historial_hoy(perfil_id: int, pelicula_id: int) -> Historial:
    """
    Upsert por día (perfil + película + fecha).
    Si existe un registro hoy, lo retorna; si no, lo crea.
    """
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
      - perfil (opcional): id del perfil que reproduce. Si no viene, usa cookie de perfil activo.
      - calidad (opcional): '1080p' | '720p' | '480p' | '360p'
      - trailer=true/false (opcional)
    """
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]
    PREFERRED = ("1080p", "720p", "480p", "360p")

    def get(self, request, pelicula_id: int):

        get_object_or_404(Pelicula, pk=pelicula_id)

        # 1) Tomar perfil: querystring o cookie firmada
        perfil_id = request.query_params.get("perfil")
        if not perfil_id:
            try:
                perfil_id = request.get_signed_cookie(COOKIE_NAME, salt=COOKIE_SALT)
            except (KeyError, BadSignature):
                perfil_id = None

        if not perfil_id:
            return Response(
                {"detail": "No hay perfil activo. Llama a POST /api/perfiles/<id>/activar/."},
                status=400
            )

        # Valida que el perfil pertenezca al usuario
        get_object_or_404(Perfil, pk=perfil_id, usuario=request.user)

        # 3) Seleccionar asset (por calidad o mejor disponible)
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

        # 4) Historial: crea/actualiza automáticamente el registro del día
        historial = _get_or_create_historial_hoy(int(perfil_id), int(pelicula_id))
        # (Opcional) resetear terminado si vuelve a reproducir:
        # if historial.terminado:
        #     historial.terminado = False
        #     historial.save(update_fields=["terminado"])

        # 5) Generar URL firmada (15 minutos)
        exp = int(time.time()) + 15 * 60
        token = _sign_download(asset.id, exp)

        file_path = reverse("stream-file", args=[asset.id, token])
        # Usar ruta relativa en lugar de URL absoluta para que funcione con Docker
        stream_url = f"{file_path}?exp={exp}&perfil={perfil_id}"

        return Response({
            "pelicula_id": pelicula_id,
            "asset_id": asset.id,
            "historial_id": historial.id_historial,  # para pings de progreso opcionales
            "url": stream_url,
            "calidad": asset.calidad,
            "mime_type": asset.mime_type,
            "es_trailer": asset.es_trailer,
            "expires_at": exp,
        })


class ListStreamsView(APIView):
    """
    Lista todas las variantes disponibles para una película (útil para selector de calidad).
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


def range_file_iterator(file_object, start, end, chunk_size=8192):
    """
    Generador que lee el archivo por chunks desde 'start' hasta 'end'.
    """
    file_object.seek(start)
    remaining = end - start + 1
    while remaining > 0:
        chunk_size_to_read = min(chunk_size, remaining)
        data = file_object.read(chunk_size_to_read)
        if not data:
            break
        remaining -= len(data)
        yield data


class StreamFileView(APIView):
    """
    Sirve el archivo local protegido por token + expiración y perfil válido.
    SOPORTA RANGE REQUESTS para permitir seek en videos.
    NO requiere autenticación JWT porque la URL está firmada con HMAC.
    """
    permission_classes = []  # Sin autenticación, la seguridad viene del token HMAC

    def get(self, request, asset_id: int, token: str):
        exp = request.query_params.get("exp")
        perfil_id = request.query_params.get("perfil")

        if not exp or not perfil_id:
            raise Http404("Parámetros inválidos.")

        if not _verify_download(asset_id, exp, token):
            raise Http404("Link vencido o inválido.")

        # Validar que el perfil exista (sin verificar usuario porque no hay JWT)
        get_object_or_404(Perfil, pk=perfil_id)

        asset = get_object_or_404(MediaAsset, pk=asset_id)

        if asset.remote_url:
            # Para producción considera URLs firmadas del storage (S3, etc.)
            return HttpResponseRedirect(asset.remote_url)

        if not asset.archivo:
            raise Http404("Archivo no disponible.")

        # Obtener el path del archivo
        file_path = asset.archivo.path
        file_size = os.path.getsize(file_path)
        content_type = asset.mime_type or 'video/mp4'

        # Parsear el header Range si existe
        range_header = request.META.get('HTTP_RANGE', '').strip()
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)

        if range_match:
            # Range Request - permitir seek en el video
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1

            # Validar rango
            if start >= file_size or end >= file_size or start > end:
                response = StreamingHttpResponse(status=416)  # Range Not Satisfiable
                response['Content-Range'] = f'bytes */{file_size}'
                return response

            # Abrir archivo y crear respuesta con el rango
            file_object = open(file_path, 'rb')
            response = StreamingHttpResponse(
                range_file_iterator(file_object, start, end),
                status=206,  # Partial Content
                content_type=content_type
            )
            response['Content-Length'] = str(end - start + 1)
            response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
            response['Accept-Ranges'] = 'bytes'

        else:
            # Request completo sin range
            file_object = open(file_path, 'rb')
            response = StreamingHttpResponse(
                file_object,
                content_type=content_type
            )
            response['Content-Length'] = str(file_size)
            response['Accept-Ranges'] = 'bytes'

        # Headers adicionales para el video
        response['Cache-Control'] = 'no-cache, private'

        return response
