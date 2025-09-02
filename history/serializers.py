from rest_framework import serializers
from .models import Historial

class HistorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historial
        fields = (
            'id_historial', 'id_perfil', 'id_pelicula',
            'fecha_vista', 'progreso_segundos', 'terminado'
        )
