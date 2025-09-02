from django.db import models
from content.models import Pelicula

class MediaAsset(models.Model):
    """
    Asset de video de una película.
    Puedes subir un archivo local (FileField) o guardar una URL remota (remote_url).
    Para MVP, con uno de los dos basta.
    """
    id = models.BigAutoField(primary_key=True)
    pelicula = models.ForeignKey(
        Pelicula, on_delete=models.CASCADE, db_column="id_pelicula", related_name="assets"
    )

    # Opción A (archivo local): se guarda dentro de MEDIA_ROOT
    archivo = models.FileField(upload_to="movies/%Y/%m/%d/", blank=True, null=True)

    # Opción B (URL remota): si ya tienes el mp4 en CDN/S3 u otro servidor
    remote_url = models.URLField(max_length=1000, blank=True, null=True)

    calidad = models.CharField(max_length=20, default="1080p")          # 480p/720p/1080p
    mime_type = models.CharField(max_length=50, default="video/mp4")
    es_trailer = models.BooleanField(default=False)

    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_assets"

    def __str__(self):
        origen = self.remote_url or (self.archivo.url if self.archivo else "sin_origen")
        return f"[{self.pelicula_id}] {self.calidad} {'TRAILER' if self.es_trailer else 'FULL'} -> {origen}"

    def clean(self):
        # Al menos uno: archivo o remote_url
        if not self.archivo and not self.remote_url:
            from django.core.exceptions import ValidationError
            raise ValidationError("Debes enviar archivo o remote_url.")
