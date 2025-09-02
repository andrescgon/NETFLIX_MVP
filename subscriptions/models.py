from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta

class Plan(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=8, decimal_places=2)  # precio en USD/COP
    duracion_dias = models.PositiveIntegerField(default=30)       # duración en días

    class Meta:
        db_table = "plan"   # 👈 nombre exacto de la tabla
        verbose_name = "Plan"
        verbose_name_plural = "Planes"

    def __str__(self):
        return f"{self.nombre} ({self.duracion_dias} días)"


class Suscripcion(models.Model):
    ESTADOS = (
        ('activa', 'Activa'),
        ('cancelada', 'Cancelada'),
        ('expirada', 'Expirada'),
    )

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='id_usuario',   # 👈 conecta con tu campo real en usuarios
        related_name='suscripciones'
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    fecha_inicio = models.DateTimeField(default=timezone.now)
    fecha_fin = models.DateTimeField()
    estado = models.CharField(max_length=10, choices=ESTADOS, default='activa')

    class Meta:
        db_table = "suscripciones"   # 👈 nombre exacto de la tabla
        verbose_name = "Suscripción"
        verbose_name_plural = "Suscripciones"
        indexes = [models.Index(fields=["usuario", "estado"])]

    def esta_activa(self):
        if self.estado != 'activa':
            return False
        return timezone.now() < self.fecha_fin


    @classmethod
    def crear_desde_plan(cls, usuario, plan):
        ahora = timezone.now()
        fin = ahora + timedelta(days=plan.duracion_dias)
        # cancela suscripciones activas previas
        cls.objects.filter(usuario=usuario, estado='activa').update(estado='cancelada')
        return cls.objects.create(
            usuario=usuario,
            plan=plan,
            fecha_inicio=ahora,
            fecha_fin=fin,
            estado='activa'
        )
