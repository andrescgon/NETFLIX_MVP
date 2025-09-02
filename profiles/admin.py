from django.contrib import admin
from .models import Perfil

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('id_perfil', 'usuario', 'nombre', 'edad')
    list_filter = ('edad',)
    search_fields = ('nombre', 'usuario__email', 'usuario__name')
    raw_id_fields = ('usuario',)
    ordering = ('id_perfil',)
