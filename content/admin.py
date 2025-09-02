from django.contrib import admin
from .models import (
    Pelicula, Actor, Director, Genero,
    PeliculaActor, PeliculaDirector, PeliculaGenero
)

class PeliculaActorInline(admin.TabularInline):
    model = PeliculaActor
    extra = 1
    raw_id_fields = ('actor',)
    verbose_name = 'Actor'
    verbose_name_plural = 'Actores'

class PeliculaDirectorInline(admin.TabularInline):
    model = PeliculaDirector
    extra = 1
    raw_id_fields = ('director',)
    verbose_name = 'Director'
    verbose_name_plural = 'Directores'

class PeliculaGeneroInline(admin.TabularInline):
    model = PeliculaGenero
    extra = 1
    raw_id_fields = ('genero',)
    verbose_name = 'Género'
    verbose_name_plural = 'Géneros'

@admin.register(Pelicula)
class PeliculaAdmin(admin.ModelAdmin):
    list_display = ('id_pelicula', 'titulo', 'clasificacion', 'fecha_estreno', 'duracion')
    search_fields = ('titulo', 'descripcion')
    list_filter = ('clasificacion',)
    ordering = ('-fecha_estreno', 'titulo')
    inlines = [PeliculaGeneroInline, PeliculaActorInline, PeliculaDirectorInline]

@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ('id_actor', 'nombre')
    search_fields = ('nombre',)
    ordering = ('nombre',)

@admin.register(Director)
class DirectorAdmin(admin.ModelAdmin):
    list_display = ('id_director', 'nombre')
    search_fields = ('nombre',)
    ordering = ('nombre',)

@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ('id_genero', 'nombre')
    search_fields = ('nombre',)
    ordering = ('nombre',)
