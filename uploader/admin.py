from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import MediaAsset

@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'pelicula', 'calidad', 'mime_type', 'es_trailer', 'creado_en', 'ver_video')
    list_filter = ('es_trailer', 'calidad', 'mime_type')
    search_fields = ('pelicula__titulo',)
    raw_id_fields = ('pelicula',)
    ordering = ('-creado_en',)
    readonly_fields = ('ver_video_link', 'archivo_path')

    def ver_video(self, obj):
        """Muestra un enlace para ver el video con localhost"""
        if obj.archivo:
            url = f"http://localhost:8000{obj.archivo.url}"
            return format_html('<a href="{}" target="_blank" style="color: #417690; font-weight: bold;">▶ Ver</a>', url)
        elif obj.remote_url:
            return format_html('<a href="{}" target="_blank" style="color: #417690; font-weight: bold;">▶ Ver (Remoto)</a>', obj.remote_url)
        return '-'
    ver_video.short_description = 'Video'

    def archivo_path(self, obj):
        """Muestra solo la ruta del archivo sin generar enlace"""
        if obj.archivo:
            return obj.archivo.name
        return '-'
    archivo_path.short_description = 'Ruta del Archivo'

    def ver_video_link(self, obj):
        """Campo de solo lectura con el enlace correcto para copiar"""
        if obj.archivo:
            url = f"http://localhost:8000{obj.archivo.url}"
            return format_html(
                '<div style="margin-bottom: 15px;">'
                '<a href="{}" target="_blank" style="font-size: 16px; padding: 10px 20px; background: #417690; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">▶ Reproducir Video</a>'
                '</div>'
                '<div style="margin-top: 10px;">'
                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">URL para copiar:</label>'
                '<input type="text" value="{}" readonly style="width: 100%; padding: 10px; font-family: monospace; font-size: 13px; border: 1px solid #ccc; border-radius: 4px;" onclick="this.select()">'
                '</div>',
                url, url
            )
        elif obj.remote_url:
            return format_html(
                '<div style="margin-bottom: 15px;">'
                '<a href="{}" target="_blank" style="font-size: 16px; padding: 10px 20px; background: #417690; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">▶ Reproducir Video (Remoto)</a>'
                '</div>'
                '<div style="margin-top: 10px;">'
                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">URL para copiar:</label>'
                '<input type="text" value="{}" readonly style="width: 100%; padding: 10px; font-family: monospace; font-size: 13px; border: 1px solid #ccc; border-radius: 4px;" onclick="this.select()">'
                '</div>',
                obj.remote_url, obj.remote_url
            )
        return format_html('<p style="color: #999;">No hay video asociado</p>')
    ver_video_link.short_description = 'Enlace de Reproducción'

    fieldsets = (
        ('Información General', {
            'fields': ('pelicula', 'calidad', 'mime_type', 'es_trailer')
        }),
        ('Archivo', {
            'fields': ('archivo', 'archivo_path', 'remote_url')
        }),
        ('Reproducción', {
            'fields': ('ver_video_link',),
            'description': 'Use este enlace para ver el video en su navegador'
        }),
        ('Fechas', {
            'fields': ('creado_en',),
            'classes': ('collapse',)
        }),
    )
