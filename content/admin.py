from django import forms
from django.contrib import admin
from django.db import connection
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import Pelicula, Actor, Director, Genero


class PeliculaAdminForm(forms.ModelForm):
    generos = forms.ModelMultipleChoiceField(
        queryset=Genero.objects.all(), required=False, label="Géneros"
    )
    actores = forms.ModelMultipleChoiceField(
        queryset=Actor.objects.all(), required=False, label="Actores"
    )
    directores = forms.ModelMultipleChoiceField(
        queryset=Director.objects.all(), required=False, label="Directores"
    )

    class Meta:
        model = Pelicula
        fields = (
            "titulo",
            "descripcion",
            "fecha_estreno",
            "duracion",
            "clasificacion",
            "miniatura",
            "generos",
            "actores",
            "directores",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            pid = self.instance.id_pelicula
            with connection.cursor() as cur:
                cur.execute(
                    "SELECT id_genero FROM public.peliculas_generos WHERE id_pelicula=%s",
                    [pid],
                )
                self.fields["generos"].initial = [row[0] for row in cur.fetchall()]

                cur.execute(
                    "SELECT id_actor FROM public.peliculas_actores WHERE id_pelicula=%s",
                    [pid],
                )
                self.fields["actores"].initial = [row[0] for row in cur.fetchall()]

                cur.execute(
                    "SELECT id_director FROM public.peliculas_directores WHERE id_pelicula=%s",
                    [pid],
                )
                self.fields["directores"].initial = [row[0] for row in cur.fetchall()]


@admin.register(Pelicula)
class PeliculaAdmin(admin.ModelAdmin):
    form = PeliculaAdminForm

    list_display = ("id_pelicula", "titulo", "clasificacion", "fecha_estreno", "duracion", "tiene_miniatura")
    search_fields = ("titulo", "descripcion")
    list_filter = ("clasificacion",)
    ordering = ("-fecha_estreno", "titulo")
    exclude = ("generos", "actores", "directores")
    actions = None

    def tiene_miniatura(self, obj):
        return "✅" if obj.miniatura else "❌"
    tiene_miniatura.short_description = "Miniatura"

    def _to_pk_set(self, selected):
        ids = set()
        if not selected:
            return ids
        for x in selected:
            if hasattr(x, "_meta"):
                pk_name = x._meta.pk.attname
                ids.add(int(getattr(x, pk_name)))
            else:
                ids.add(int(x))
        return ids

    def _sync_simple_m2m(self, table, col_fk, pelicula_id, selected_values):
        selected_ids = self._to_pk_set(selected_values)
        with connection.cursor() as cur:
            cur.execute(
                f"SELECT {col_fk} FROM public.{table} WHERE id_pelicula = %s",
                [pelicula_id],
            )
            current = set(row[0] for row in cur.fetchall())

            to_delete = current - selected_ids
            to_insert = selected_ids - current

            if to_delete:
                cur.execute(
                    f"DELETE FROM public.{table} "
                    f"WHERE id_pelicula = %s AND {col_fk} = ANY(%s)",
                    [pelicula_id, list(to_delete)],
                )

            if to_insert:
                params = [(pelicula_id, x) for x in to_insert]
                cur.executemany(
                    f"INSERT INTO public.{table} (id_pelicula, {col_fk}) VALUES (%s, %s)",
                    params,
                )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        pid = obj.id_pelicula
        self._sync_simple_m2m(
            table="peliculas_generos",
            col_fk="id_genero",
            pelicula_id=pid,
            selected_values=form.cleaned_data.get("generos"),
        )
        self._sync_simple_m2m(
            table="peliculas_actores",
            col_fk="id_actor",
            pelicula_id=pid,
            selected_values=form.cleaned_data.get("actores"),
        )
        self._sync_simple_m2m(
            table="peliculas_directores",
            col_fk="id_director",
            pelicula_id=pid,
            selected_values=form.cleaned_data.get("directores"),
        )


    def get_deleted_objects(self, objs, request):
        return [], {}, set(), []  # deletions, model_count, perms_needed, protected

   
    def delete_model(self, request, obj):
        pid = obj.id_pelicula
        with connection.cursor() as cur:
            cur.execute("DELETE FROM public.peliculas_actores    WHERE id_pelicula = %s", [pid])
            cur.execute("DELETE FROM public.peliculas_directores WHERE id_pelicula = %s", [pid])
            cur.execute("DELETE FROM public.peliculas_generos    WHERE id_pelicula = %s", [pid])
        obj.delete()


    def delete_queryset(self, request, queryset):
        ids = [p.id_pelicula for p in queryset]
        if not ids:
            return
        with connection.cursor() as cur:
            cur.execute("DELETE FROM public.peliculas_actores    WHERE id_pelicula = ANY(%s)", [ids])
            cur.execute("DELETE FROM public.peliculas_directores WHERE id_pelicula = ANY(%s)", [ids])
            cur.execute("DELETE FROM public.peliculas_generos    WHERE id_pelicula = ANY(%s)", [ids])
        queryset.delete()



@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ("id_actor", "nombre")
    search_fields = ("nombre",)
    ordering = ("nombre",)


    def get_deleted_objects(self, objs, request):
        return [], {}, set(), []  

    # Borrado 
    def delete_model(self, request, obj):
        with connection.cursor() as cur:
            cur.execute(
                "DELETE FROM public.peliculas_actores WHERE id_actor = %s",
                [obj.id_actor],
            )
        obj.delete()

    def delete_view(self, request, object_id, extra_context=None):
        if request.method == "POST":
            obj = self.get_object(request, object_id)
            if obj:
                self.delete_model(request, obj)
            return HttpResponseRedirect(reverse("admin:content_actor_changelist"))
        return super().delete_view(request, object_id, extra_context=extra_context)


@admin.register(Director)
class DirectorAdmin(admin.ModelAdmin):
    list_display = ("id_director", "nombre")
    search_fields = ("nombre",)
    ordering = ("nombre",)

    def get_deleted_objects(self, objs, request):
        return [], {}, set(), []

    def delete_model(self, request, obj):
        with connection.cursor() as cur:
            cur.execute(
                "DELETE FROM public.peliculas_directores WHERE id_director = %s",
                [obj.id_director],
            )
        obj.delete()

    def delete_view(self, request, object_id, extra_context=None):
        if request.method == "POST":
            obj = self.get_object(request, object_id)
            if obj:
                self.delete_model(request, obj)
            return HttpResponseRedirect(reverse("admin:content_director_changelist"))
        return super().delete_view(request, object_id, extra_context=extra_context)


@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ("id_genero", "nombre")
    search_fields = ("nombre",)
    ordering = ("nombre",)

    def get_deleted_objects(self, objs, request):
        return [], {}, set(), []

    def delete_model(self, request, obj):
        with connection.cursor() as cur:
            cur.execute(
                "DELETE FROM public.peliculas_generos WHERE id_genero = %s",
                [obj.id_genero],
            )
        obj.delete()

    def delete_view(self, request, object_id, extra_context=None):
        if request.method == "POST":
            obj = self.get_object(request, object_id)
            if obj:
                self.delete_model(request, obj)
            return HttpResponseRedirect(reverse("admin:content_genero_changelist"))
        return super().delete_view(request, object_id, extra_context=extra_context)
