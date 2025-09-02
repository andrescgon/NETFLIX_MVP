from django.urls import path
from .views import CrearPreferenciaView, MercadoPagoWebhookView

urlpatterns = [
    path('mp/checkout/', CrearPreferenciaView.as_view(), name='mp-crear-checkout'),
    path('webhook/mp/', MercadoPagoWebhookView.as_view(), name='mp-webhook'),
]
