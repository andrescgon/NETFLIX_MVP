from django.contrib import admin
from .models import Historial

@admin.register(Historial)
class HistorialAdmin(admin.ModelAdmin):
    list_display = ('id_historial', 'id_perfil', 'id_pelicula', 'fecha_vista', 'progreso_segundos', 'terminado')
    list_filter  = ('terminado', 'fecha_vista')
    search_fields = ('id_perfil', 'id_pelicula')
