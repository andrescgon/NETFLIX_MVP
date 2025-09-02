from django.db import models
from django.conf import settings

class Perfil(models.Model):
    id_perfil = models.AutoField(primary_key=True, db_column='id_perfil')
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='perfiles'
    )
    nombre = models.CharField(max_length=50)
    edad = models.IntegerField(null=True, blank=True)
    es_admin = models.BooleanField(default=False)  # ← Solo si agregaste la columna

    class Meta:
        db_table = 'perfiles'
        managed = False  # la tabla YA existe

    def __str__(self):
        return f'{self.nombre} (u:{self.usuario_id})'
