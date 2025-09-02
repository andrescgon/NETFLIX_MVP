from django.db import models

# ===== Tablas simples =====
class Actor(models.Model):
    id_actor = models.AutoField(primary_key=True, db_column="id_actor")
    nombre = models.CharField(max_length=255)

    class Meta:
        db_table = "actores"
        managed = False

    def __str__(self):
        return self.nombre


class Director(models.Model):
    id_director = models.AutoField(primary_key=True, db_column="id_director")
    nombre = models.CharField(max_length=255)

    class Meta:
        db_table = "directores"
        managed = False

    def __str__(self):
        return self.nombre


class Genero(models.Model):
    id_genero = models.AutoField(primary_key=True, db_column="id_genero")
    nombre = models.CharField(max_length=255)

    class Meta:
        db_table = "generos"
        managed = False

    def __str__(self):
        return self.nombre


# ===== Tabla principal =====
class Pelicula(models.Model):
    id_pelicula = models.AutoField(primary_key=True, db_column="id_pelicula")
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    fecha_estreno = models.DateField(blank=True, null=True)
    duracion = models.IntegerField(blank=True, null=True)  # en minutos
    clasificacion = models.CharField(max_length=50, blank=True, null=True)

    # Relaciones M2M mediante tablas puente existentes
    actores = models.ManyToManyField(Actor, through="PeliculaActor", related_name="peliculas")
    directores = models.ManyToManyField(Director, through="PeliculaDirector", related_name="peliculas")
    generos = models.ManyToManyField(Genero, through="PeliculaGenero", related_name="peliculas")

    class Meta:
        db_table = "peliculas"
        managed = False

    def __str__(self):
        return self.titulo


# ===== Tablas puente =====
class PeliculaActor(models.Model):
    pelicula = models.ForeignKey(Pelicula, on_delete=models.CASCADE, db_column="id_pelicula")
    actor = models.ForeignKey(Actor, on_delete=models.CASCADE, db_column="id_actor")

    class Meta:
        db_table = "peliculas_actores"
        managed = False
        unique_together = (("pelicula", "actor"),)


class PeliculaDirector(models.Model):
    pelicula = models.ForeignKey(Pelicula, on_delete=models.CASCADE, db_column="id_pelicula")
    director = models.ForeignKey(Director, on_delete=models.CASCADE, db_column="id_director")

    class Meta:
        db_table = "peliculas_directores"
        managed = False
        unique_together = (("pelicula", "director"),)


class PeliculaGenero(models.Model):
    pelicula = models.ForeignKey(Pelicula, on_delete=models.CASCADE, db_column="id_pelicula")
    genero = models.ForeignKey(Genero, on_delete=models.CASCADE, db_column="id_genero")

    class Meta:
        db_table = "peliculas_generos"
        managed = False
        unique_together = (("pelicula", "genero"),)
