from django.contrib import admin
from .models import Plan, Suscripcion

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    # usa solo campos que EXISTEN seguro en tu modelo
    list_display = ('id', 'nombre', 'precio', 'duracion_dias')
    search_fields = ('nombre',)
    ordering = ('id',)

@admin.register(Suscripcion)
class SuscripcionAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'plan', 'estado', 'fecha_inicio', 'fecha_fin')
    list_filter = ('estado', 'plan')
    search_fields = ('usuario__email', 'usuario__name', 'plan__nombre')
    raw_id_fields = ('usuario', 'plan')
    ordering = ('-fecha_inicio',)
