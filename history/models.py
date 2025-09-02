from django.db import models

class Historial(models.Model):
    id_historial = models.AutoField(primary_key=True, db_column='id_historial')
    id_perfil = models.IntegerField(db_column='id_perfil')
    id_pelicula = models.IntegerField(db_column='id_pelicula')
    fecha_vista = models.DateTimeField(db_column='fecha_vista', auto_now_add=True)
    progreso_segundos = models.IntegerField(db_column='progreso_segundos', default=0)
    terminado = models.BooleanField(db_column='terminado', default=False)

    class Meta:
        db_table = 'historial'   # está en esquema public (search_path ya incluye public)
        managed = False          # Django NO la crea/ni migra (ya existe)
        ordering = ['-fecha_vista']

    def __str__(self):
        return f'Perfil {self.id_perfil} -> Película {self.id_pelicula} ({self.fecha_vista:%Y-%m-%d})'
