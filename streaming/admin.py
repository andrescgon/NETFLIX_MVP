# streaming/admin.py
from django.contrib import admin, messages
from django.utils.html import format_html
from .models import MediaAssetReadOnly  # proxy

@admin.register(MediaAssetReadOnly)
class MediaAssetReadOnlyAdmin(admin.ModelAdmin):
    list_display = (
        "id", "pelicula", "origen", "calidad", "mime_type",
        "peso_mb", "es_trailer", "creado_en", "ver",
    )
    list_filter = ("es_trailer", "calidad", "mime_type")
    search_fields = ("pelicula__titulo", "mime_type", "calidad")
    ordering = ("-creado_en",)
    raw_id_fields = ("pelicula",)
    readonly_fields = ("pelicula", "archivo", "remote_url", "calidad",
                       "mime_type", "es_trailer", "creado_en", "preview")
    actions = ["borrar_assets_completamente"]  # 👈 acción de borrado seguro
    fieldsets = (
        (None, {
            "fields": (
                "pelicula",
                ("archivo", "remote_url"),
                ("calidad", "mime_type", "es_trailer"),
                "preview",
                "creado_en",
            )
        }),
    )

    # —— solo lectura para add/change; sí permite delete ——
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        # Permite ver la ficha (GET) pero no guardar cambios (POST)
        return request.method in ("GET", "HEAD", "OPTIONS")

    def has_delete_permission(self, request, obj=None):
        return True  # 👈 permitir borrar

    # —— helpers visuales ——
    def origen(self, obj):
        return "Remoto" if obj.remote_url else ("Local" if obj.archivo else "—")
    origen.short_description = "Origen"

    def peso_mb(self, obj):
        try:
            if obj.archivo and hasattr(obj.archivo, "size") and obj.archivo.size:
                return f"{obj.archivo.size / (1024 * 1024):.2f}"
        except Exception:
            pass
        return "—"
    peso_mb.short_description = "Tamaño (MB)"

    def _asset_url(self, obj):
        if obj.remote_url:
            return obj.remote_url
        if obj.archivo:
            try:
                return obj.archivo.url
            except Exception:
                return None
        return None

    def ver(self, obj):
        url = self._asset_url(obj)
        if not url:
            return "—"
        return format_html('<a href="{}" target="_blank">Abrir</a>', url)
    ver.short_description = "Link"

    def preview(self, obj):
        url = self._asset_url(obj)
        if not url:
            return "—"
        mime = (obj.mime_type or "").lower()
        if not mime.startswith("video/"):
            return format_html('<a href="{}" target="_blank">Abrir archivo</a>', url)
        return format_html(
            '<video src="{}" controls style="max-width:420px; max-height:240px; display:block;"></video>'
            '<div style="margin-top:4px;"><a href="{}" target="_blank">Abrir en pestaña</a></div>',
            url, url
        )
    preview.short_description = "Preview"

    # —— acción para borrar DB + archivo físico (si existe) ——
    def borrar_assets_completamente(self, request, queryset):
        borrados = 0
        for obj in queryset:
            # Borra archivo físico si era local
            if getattr(obj, "archivo", None):
                try:
                    # delete(save=False) borra el fichero sin intentar guardar el modelo
                    obj.archivo.delete(save=False)
                except Exception:
                    pass
            # Borra el registro
            obj.delete()
            borrados += 1
        self.message_user(
            request,
            f"Se eliminaron {borrados} asset(s) y sus archivos locales (si aplicaba).",
            level=messages.SUCCESS
        )
    borrar_assets_completamente.short_description = "Eliminar asset(s) y archivo(s) del disco"
