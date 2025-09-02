from django.contrib import admin
from .models import MediaAsset

@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'pelicula', 'calidad', 'mime_type', 'es_trailer', 'creado_en', 'origen')
    list_filter = ('es_trailer', 'calidad', 'mime_type')
    search_fields = ('pelicula__titulo',)
    raw_id_fields = ('pelicula',)
    ordering = ('-creado_en',)

    def origen(self, obj):
        return obj.remote_url or (obj.archivo.url if obj.archivo else '')
    origen.short_description = 'Origen'
