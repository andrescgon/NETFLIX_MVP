from django.urls import path
from .views import ListaPeliculasView, DetallePeliculaView

urlpatterns = [
    path("peliculas/", ListaPeliculasView.as_view(), name="lista-peliculas"),
    path("peliculas/<int:id_pelicula>/", DetallePeliculaView.as_view(), name="detalle-pelicula"),
]
