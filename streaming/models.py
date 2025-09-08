# streaming/models.py
from django.db import models
from uploader.models import MediaAsset  # reutilizamos el modelo real

class MediaAssetReadOnly(MediaAsset):
    class Meta:
        proxy = True
        verbose_name = "Revisión de media"
        verbose_name_plural = "Revisión de media"