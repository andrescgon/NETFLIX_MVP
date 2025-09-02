from django.db import models
from django.conf import settings

class Pago(models.Model):
    PROVEEDOR = (('mercadopago', 'MercadoPago'),)
    ESTADO = (('pending','Pendiente'), ('paid','Pagado'), ('failed','Fallido'))

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='id_usuario', related_name='pagos')
    plan_nombre = models.CharField(max_length=100)
    plan_id_ref = models.IntegerField()        # id del Plan
    monto = models.DecimalField(max_digits=8, decimal_places=2)
    moneda = models.CharField(max_length=10, default='COP')
    proveedor = models.CharField(max_length=20, choices=PROVEEDOR, default='mercadopago')
    proveedor_payment_id = models.CharField(max_length=200, blank=True, null=True)   # payment id MP
    proveedor_preference_id = models.CharField(max_length=200, blank=True, null=True)
    estado = models.CharField(max_length=10, choices=ESTADO, default='pending')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pagos"
