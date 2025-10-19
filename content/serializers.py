from rest_framework import serializers
from .models import Pelicula, Actor, Director, Genero

class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = '__all__'


class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = '__all__'


class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'


class PeliculaListaSerializer(serializers.ModelSerializer):
    generos = GeneroSerializer(many=True, read_only=True)
    actores = ActorSerializer(many=True, read_only=True)
    directores = DirectorSerializer(many=True, read_only=True)
    miniatura = serializers.SerializerMethodField()

    class Meta:
        model = Pelicula
        fields = ("id_pelicula", "titulo", "clasificacion", "fecha_estreno", "generos", "actores", "directores", "miniatura")

    def get_miniatura(self, obj):
        if obj.miniatura:
            # Devolver solo la ruta relativa, no la URL absoluta
            return obj.miniatura.url
        return None


class PeliculaDetalleSerializer(serializers.ModelSerializer):
    # Para lectura (GET)
    actores_detalle = ActorSerializer(source='actores', many=True, read_only=True)
    directores_detalle = DirectorSerializer(source='directores', many=True, read_only=True)
    generos_detalle = GeneroSerializer(source='generos', many=True, read_only=True)

    # Para escritura (POST/PUT)
    actores = serializers.PrimaryKeyRelatedField(
        queryset=Actor.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    directores = serializers.PrimaryKeyRelatedField(
        queryset=Director.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    generos = serializers.PrimaryKeyRelatedField(
        queryset=Genero.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Pelicula
        fields = (
            "id_pelicula", "titulo", "descripcion", "fecha_estreno",
            "duracion", "clasificacion", "miniatura",
            "actores", "directores", "generos",
            "actores_detalle", "directores_detalle", "generos_detalle"
        )
        extra_kwargs = {
            'miniatura': {'required': False}
        }

    def create(self, validated_data):
        actores_data = validated_data.pop('actores', [])
        directores_data = validated_data.pop('directores', [])
        generos_data = validated_data.pop('generos', [])

        print("=== DEBUG SERIALIZER CREATE ===")
        print("Actores:", actores_data)
        print("Directores:", directores_data)
        print("Géneros:", generos_data)

        pelicula = Pelicula.objects.create(**validated_data)
        print("Película creada:", pelicula.id_pelicula)

        if actores_data:
            print("Asignando actores...")
            pelicula.actores.set(actores_data)
        if directores_data:
            print("Asignando directores...")
            pelicula.directores.set(directores_data)
        if generos_data:
            print("Asignando géneros...")
            pelicula.generos.set(generos_data)

        print("Relaciones asignadas")
        return pelicula

    def update(self, instance, validated_data):
        actores_data = validated_data.pop('actores', None)
        directores_data = validated_data.pop('directores', None)
        generos_data = validated_data.pop('generos', None)

        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Actualizar relaciones many-to-many
        if actores_data is not None:
            instance.actores.set(actores_data)
        if directores_data is not None:
            instance.directores.set(directores_data)
        if generos_data is not None:
            instance.generos.set(generos_data)

        return instance

    def to_representation(self, instance):
        # Para las respuestas (GET), usar los campos detallados
        representation = super().to_representation(instance)
        representation['actores'] = representation.pop('actores_detalle', [])
        representation['directores'] = representation.pop('directores_detalle', [])
        representation['generos'] = representation.pop('generos_detalle', [])

        # Asegurar que miniatura sea solo la ruta relativa
        if instance.miniatura:
            representation['miniatura'] = instance.miniatura.url
        else:
            representation['miniatura'] = None

        return representation
