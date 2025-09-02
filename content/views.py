from rest_framework import generics, permissions
from django.db.models import Q
from .models import Pelicula
from .serializers import PeliculaListaSerializer, PeliculaDetalleSerializer
from subscriptions.permissions import EsSuscriptorActivo  # tu permiso

class ListaPeliculasView(generics.ListAPIView):
    """
    GET /api/contenido/peliculas/
    Filtros (query params):
      - q (busca en título/descr)
      - genero_id
      - actor_id
      - director_id
      - anio (fecha_estreno__year)
    """
    serializer_class = PeliculaListaSerializer
    permission_classes = [permissions.IsAuthenticated, EsSuscriptorActivo]

    def get_queryset(self):
        qs = (Pelicula.objects
              .all()
              .prefetch_related("generos", "actores", "directores"))

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(titulo__icontains=q) | Q(descripcion__icontains=q))

        genero_id = self.request.query_params.get("genero_id")
        if genero_id:
            qs = qs.filter(generos__id_genero=genero_id)

        actor_id = self.request.query_params.get("actor_id")
        if actor_id:
            qs = qs.filter(actores__id_actor=actor_id)

        director_id = self.request.query_params.get("director_id")
        if director_id:
            qs = qs.filter(directores__id_director=director_id)

        anio = self.request.query_params.get("anio")
        if anio:
            qs = qs.filter(fecha_estreno__year=anio)

        return qs.distinct().order_by("-fecha_estreno", "titulo")


class DetallePeliculaView(generics.RetrieveAPIView):
    """
    GET /api/contenido/peliculas/<id_pelicula>/
    """
    queryset = (Pelicula.objects
                .all()
                .prefetch_related("generos", "actores", "directores"))
    serializer_class = PeliculaDetalleSerializer
    permission_classes = [permissions.IsAuthenticated, EsSuscriptorActivo]
    lookup_field = "id_pelicula"
