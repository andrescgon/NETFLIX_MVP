from django.urls import path
from .views import (
    ListaPeliculasView,
    DetallePeliculaView,
    FiltrosView,
    ListaActoresView,
    ListaDirectoresView,
    ListaGenerosView
)

urlpatterns = [
    path("peliculas/", ListaPeliculasView.as_view(), name="lista-peliculas"),
    path("peliculas/<int:id_pelicula>/", DetallePeliculaView.as_view(), name="detalle-pelicula"),
    path("filtros/", FiltrosView.as_view(), name="filtros"),
    path("actores/", ListaActoresView.as_view(), name="lista-actores"),
    path("directores/", ListaDirectoresView.as_view(), name="lista-directores"),
    path("generos/", ListaGenerosView.as_view(), name="lista-generos"),
]
