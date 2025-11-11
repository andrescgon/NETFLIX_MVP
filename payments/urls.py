from django.urls import path
from .views import CrearPreferenciaView, MercadoPagoWebhookView

# ==================== MERCADO PAGO (ACTIVO) ====================
urlpatterns = [
    path('mp/checkout/', CrearPreferenciaView.as_view(), name='mp-crear-checkout'),
    path('webhook/mp/', MercadoPagoWebhookView.as_view(), name='mp-webhook'),
]

# ==================== STRIPE (COMENTADO - ESTRUCTURA) ====================
# from .views_extra import CrearStripeCheckoutView, StripeWebhookView
# urlpatterns += [
#     path('stripe/checkout/', CrearStripeCheckoutView.as_view(), name='stripe-crear-checkout'),
#     path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
# ]

# ==================== PAYPAL (COMENTADO - ESTRUCTURA) ====================
# from .views_extra import CrearPayPalPaymentView, PayPalWebhookView
# urlpatterns += [
#     path('paypal/checkout/', CrearPayPalPaymentView.as_view(), name='paypal-crear-pago'),
#     path('webhook/paypal/', PayPalWebhookView.as_view(), name='paypal-webhook'),
# ]

# ==================== WOMPI (COMENTADO - ESTRUCTURA) ====================
# from .views_extra import CrearWompiTransactionView, WompiWebhookView
# urlpatterns += [
#     path('wompi/checkout/', CrearWompiTransactionView.as_view(), name='wompi-crear-transaccion'),
#     path('webhook/wompi/', WompiWebhookView.as_view(), name='wompi-webhook'),
# ]

# ==================== PSE (COMENTADO - ESTRUCTURA) ====================
# from .views_extra import CrearPSEPaymentView
# urlpatterns += [
#     path('pse/checkout/', CrearPSEPaymentView.as_view(), name='pse-crear-pago'),
# ]

# ==================== NEQUI (COMENTADO - ESTRUCTURA) ====================
# from .views_extra import CrearNequiPaymentView
# urlpatterns += [
#     path('nequi/checkout/', CrearNequiPaymentView.as_view(), name='nequi-crear-pago'),
# ]

# ==================== DAVIPLATA (COMENTADO - ESTRUCTURA) ====================
# from .views_extra import CrearDaviplataPaymentView
# urlpatterns += [
#     path('daviplata/checkout/', CrearDaviplataPaymentView.as_view(), name='daviplata-crear-pago'),
# ]
