from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import MediaAsset
from .serializers import MediaAssetSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated  # o True si quieres público
        return request.user and request.user.is_staff

class MediaAssetViewSet(viewsets.ModelViewSet):
    queryset = MediaAsset.objects.select_related("pelicula").order_by("-creado_en")
    serializer_class = MediaAssetSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # para subir archivo o JSON

    # Filtros simples por query params (pelicula_id, calidad, trailer)
    def get_queryset(self):
        qs = super().get_queryset()
        pid = self.request.query_params.get("pelicula_id")
        if pid:
            qs = qs.filter(pelicula_id=pid)
        calidad = self.request.query_params.get("calidad")
        if calidad:
            qs = qs.filter(calidad__iexact=calidad)
        trailer = self.request.query_params.get("trailer")
        if trailer is not None:
            val = trailer.lower() in ("1", "true", "t", "yes", "si")
            qs = qs.filter(es_trailer=val)
        return qs
