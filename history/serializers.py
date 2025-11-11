from rest_framework import serializers
from .models import Historial
from content.models import Pelicula
from profiles.models import Perfil
from users.models import Usuario

class HistorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historial
        fields = (
            'id_historial', 'id_perfil', 'id_pelicula',
            'fecha_vista', 'progreso_segundos', 'terminado'
        )


class HistorialAdminSerializer(serializers.ModelSerializer):
    pelicula = serializers.SerializerMethodField()
    perfil = serializers.SerializerMethodField()
    usuario = serializers.SerializerMethodField()
    fecha_visualizacion = serializers.DateTimeField(source='fecha_vista')
    segundos_vistos = serializers.IntegerField(source='progreso_segundos')
    completada = serializers.BooleanField(source='terminado')

    class Meta:
        model = Historial
        fields = (
            'id_historial', 'pelicula', 'perfil', 'usuario',
            'fecha_visualizacion', 'segundos_vistos', 'completada'
        )

    def get_pelicula(self, obj):
        try:
            pelicula = Pelicula.objects.get(id_pelicula=obj.id_pelicula)
            return {
                'id_pelicula': pelicula.id_pelicula,
                'titulo': pelicula.titulo,
                'duracion': pelicula.duracion,
                'miniatura': pelicula.miniatura.url if pelicula.miniatura else None
            }
        except Pelicula.DoesNotExist:
            return None

    def get_perfil(self, obj):
        try:
            perfil = Perfil.objects.get(id_perfil=obj.id_perfil)
            return {
                'id_perfil': perfil.id_perfil,
                'nombre': perfil.nombre
            }
        except Perfil.DoesNotExist:
            return None

    def get_usuario(self, obj):
        try:
            perfil = Perfil.objects.get(id_perfil=obj.id_perfil)
            usuario = perfil.usuario
            return {
                'id_usuario': usuario.id_usuario,
                'name': usuario.name,
                'email': usuario.email
            }
        except (Perfil.DoesNotExist, Usuario.DoesNotExist):
            return None
