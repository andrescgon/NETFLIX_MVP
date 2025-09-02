from django.urls import path
from .views import PlayPeliculaView, ListStreamsView, StreamFileView

urlpatterns = [
    path('play/<int:pelicula_id>/', PlayPeliculaView.as_view(), name='play-pelicula'),
    path('list/<int:pelicula_id>/', ListStreamsView.as_view(), name='list-streams'),
    path('file/<int:asset_id>/<str:token>/', StreamFileView.as_view(), name='stream-file'),
]
