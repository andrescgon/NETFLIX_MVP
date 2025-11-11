from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Pelicula, Genero, Actor, Director
from .serializers import PeliculaListaSerializer, PeliculaDetalleSerializer, GeneroSerializer, ActorSerializer, DirectorSerializer
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


class FiltrosView(APIView):
    """
    GET /api/contenido/filtros/
    Retorna listas de géneros, actores y directores para los filtros
    """
    permission_classes = [permissions.IsAuthenticated, EsSuscriptorActivo]

    def get(self, request):
        generos = Genero.objects.all().order_by('nombre')
        actores = Actor.objects.all().order_by('nombre')
        directores = Director.objects.all().order_by('nombre')

        return Response({
            'generos': GeneroSerializer(generos, many=True).data,
            'actores': ActorSerializer(actores, many=True).data,
            'directores': DirectorSerializer(directores, many=True).data,
        })


class ListaActoresView(generics.ListAPIView):
    """
    GET /api/contenido/actores/
    Lista todos los actores
    """
    queryset = Actor.objects.all().order_by('nombre')
    serializer_class = ActorSerializer
    permission_classes = [permissions.IsAuthenticated]


class ListaDirectoresView(generics.ListAPIView):
    """
    GET /api/contenido/directores/
    Lista todos los directores
    """
    queryset = Director.objects.all().order_by('nombre')
    serializer_class = DirectorSerializer
    permission_classes = [permissions.IsAuthenticated]


class ListaGenerosView(generics.ListAPIView):
    """
    GET /api/contenido/generos/
    Lista todos los géneros
    """
    queryset = Genero.objects.all().order_by('nombre')
    serializer_class = GeneroSerializer
    permission_classes = [permissions.IsAuthenticated]
