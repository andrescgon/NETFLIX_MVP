from rest_framework import serializers
from .models import Pelicula, Actor, Director, Genero

class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ("id_actor", "nombre")


class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = ("id_director", "nombre")


class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = ("id_genero", "nombre")


class PeliculaListaSerializer(serializers.ModelSerializer):
    generos = GeneroSerializer(many=True, read_only=True)

    class Meta:
        model = Pelicula
        fields = ("id_pelicula", "titulo", "clasificacion", "fecha_estreno", "generos")


class PeliculaDetalleSerializer(serializers.ModelSerializer):
    actores = ActorSerializer(many=True, read_only=True)
    directores = DirectorSerializer(many=True, read_only=True)
    generos = GeneroSerializer(many=True, read_only=True)

    class Meta:
        model = Pelicula
        fields = (
            "id_pelicula", "titulo", "descripcion", "fecha_estreno",
            "duracion", "clasificacion", "actores", "directores", "generos"
        )
