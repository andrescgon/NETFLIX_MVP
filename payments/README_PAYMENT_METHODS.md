# Métodos de Pago - Netflix MVP

Este documento explica cómo activar y configurar diferentes métodos de pago en el sistema.

## Estado Actual

**Activo:**
- ✅ Mercado Pago

**Disponibles (Estructura Comentada):**
- 💳 Stripe
- 💰 PayPal
- 🇨🇴 Wompi (Colombia)
- 🏦 PSE (Colombia)
- 📱 Nequi (Colombia)
- 📱 DaviPlata (Colombia)

---

## 1. Mercado Pago (ACTIVO)

### Configuración Actual
Ya está configurado y funcionando.

**Variables de entorno necesarias:**
```env
MP_ACCESS_TOKEN=tu_access_token_de_mercadopago
FRONTEND_SUCCESS_URL=http://localhost:5173/payment-success
FRONTEND_CANCEL_URL=http://localhost:5173/payment-cancel
```

**Endpoints:**
- `POST /api/pagos/mp/checkout/` - Crear preferencia de pago
- `POST /api/pagos/webhook/mp/` - Webhook para notificaciones

---

## 2. Stripe

### Cómo Activar

1. **Instalar dependencia:**
   ```bash
   pip install stripe
   ```

2. **Agregar a `requirements.txt`:**
   ```
   stripe==7.0.0
   ```

3. **Configurar variables de entorno en `.env`:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Descomentar en `payments/views.py`:**
   ```python
   # Líneas 21-22
   import stripe
   stripe.api_key = settings.STRIPE_SECRET_KEY
   ```

5. **Descomentar en `payments/urls.py`:**
   ```python
   # Líneas 11-15
   from .views_extra import CrearStripeCheckoutView, StripeWebhookView
   urlpatterns += [
       path('stripe/checkout/', CrearStripeCheckoutView.as_view(), name='stripe-crear-checkout'),
       path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
   ]
   ```

6. **Mover código de `views_extra.py` a `views.py`:**
   - Copia las clases `CrearStripeCheckoutView` y `StripeWebhookView`

**Endpoints resultantes:**
- `POST /api/pagos/stripe/checkout/` - Crear sesión de checkout
- `POST /api/pagos/webhook/stripe/` - Webhook de Stripe

---

## 3. PayPal

### Cómo Activar

1. **Instalar dependencia:**
   ```bash
   pip install paypalrestsdk
   ```

2. **Agregar a `requirements.txt`:**
   ```
   paypalrestsdk==1.13.1
   ```

3. **Configurar variables de entorno en `.env`:**
   ```env
   PAYPAL_MODE=sandbox  # o 'live' para producción
   PAYPAL_CLIENT_ID=tu_client_id
   PAYPAL_CLIENT_SECRET=tu_client_secret
   ```

4. **Descomentar en `payments/views.py`:**
   ```python
   # Líneas 25-32
   from paypalrestsdk import Payment as PayPalPayment
   import paypalrestsdk

   paypalrestsdk.configure({
       "mode": settings.PAYPAL_MODE,
       "client_id": settings.PAYPAL_CLIENT_ID,
       "client_secret": settings.PAYPAL_CLIENT_SECRET
   })
   ```

5. **Descomentar en `payments/urls.py`:**
   ```python
   # Líneas 18-22
   from .views_extra import CrearPayPalPaymentView, PayPalWebhookView
   urlpatterns += [
       path('paypal/checkout/', CrearPayPalPaymentView.as_view(), name='paypal-crear-pago'),
       path('webhook/paypal/', PayPalWebhookView.as_view(), name='paypal-webhook'),
   ]
   ```

6. **Mover código de `views_extra.py` a `views.py`**

**Endpoints resultantes:**
- `POST /api/pagos/paypal/checkout/` - Crear pago PayPal
- `POST /api/pagos/webhook/paypal/` - Webhook de PayPal

---

## 4. Wompi (Colombia)

### Cómo Activar

1. **Instalar dependencia:**
   ```bash
   pip install requests
   ```

2. **Configurar variables de entorno en `.env`:**
   ```env
   WOMPI_PUBLIC_KEY=pub_test_...
   WOMPI_PRIVATE_KEY=prv_test_...
   WOMPI_EVENTS_SECRET=tu_events_secret
   ```

3. **Descomentar en `payments/urls.py`:**
   ```python
   # Líneas 25-29
   from .views_extra import CrearWompiTransactionView, WompiWebhookView
   urlpatterns += [
       path('wompi/checkout/', CrearWompiTransactionView.as_view(), name='wompi-crear-transaccion'),
       path('webhook/wompi/', WompiWebhookView.as_view(), name='wompi-webhook'),
   ]
   ```

4. **Mover código de `views_extra.py` a `views.py`**

**Endpoints resultantes:**
- `POST /api/pagos/wompi/checkout/` - Crear transacción Wompi
- `POST /api/pagos/webhook/wompi/` - Webhook de Wompi

---

## 5. PSE (Colombia)

PSE requiere integración con un agregador como ePayco, PayU o Wompi.

### Cómo Activar (con ePayco)

1. **Instalar dependencia:**
   ```bash
   pip install epayco-python
   ```

2. **Configurar variables de entorno:**
   ```env
   EPAYCO_PUBLIC_KEY=tu_public_key
   EPAYCO_PRIVATE_KEY=tu_private_key
   EPAYCO_CUSTOMER_ID=tu_customer_id
   EPAYCO_P_KEY=tu_p_key
   ```

3. **Descomentar en `payments/urls.py`:**
   ```python
   # Líneas 32-35
   from .views_extra import CrearPSEPaymentView
   urlpatterns += [
       path('pse/checkout/', CrearPSEPaymentView.as_view(), name='pse-crear-pago'),
   ]
   ```

**Endpoint resultante:**
- `POST /api/pagos/pse/checkout/` - Crear pago PSE

---

## 6. Nequi (Colombia)

### Cómo Activar

Requiere integración con Nequi Business o un agregador.

1. **Configurar variables de entorno:**
   ```env
   NEQUI_API_KEY=tu_api_key
   NEQUI_CLIENT_ID=tu_client_id
   NEQUI_CLIENT_SECRET=tu_client_secret
   ```

2. **Descomentar en `payments/urls.py`:**
   ```python
   # Líneas 38-41
   from .views_extra import CrearNequiPaymentView
   urlpatterns += [
       path('nequi/checkout/', CrearNequiPaymentView.as_view(), name='nequi-crear-pago'),
   ]
   ```

**Endpoint resultante:**
- `POST /api/pagos/nequi/checkout/` - Crear pago Nequi

---

## 7. DaviPlata (Colombia)

### Cómo Activar

Requiere integración con DaviPlata o un agregador.

1. **Configurar variables de entorno:**
   ```env
   DAVIPLATA_API_KEY=tu_api_key
   DAVIPLATA_MERCHANT_ID=tu_merchant_id
   ```

2. **Descomentar en `payments/urls.py`:**
   ```python
   # Líneas 44-47
   from .views_extra import CrearDaviplataPaymentView
   urlpatterns += [
       path('daviplata/checkout/', CrearDaviplataPaymentView.as_view(), name='daviplata-crear-pago'),
   ]
   ```

**Endpoint resultante:**
- `POST /api/pagos/daviplata/checkout/` - Crear pago DaviPlata

---

## Estructura del Modelo de Pago

El modelo `Pago` soporta todos estos métodos:

```python
class Pago(models.Model):
    usuario = ForeignKey(Usuario)
    plan_nombre = CharField
    plan_id_ref = IntegerField
    monto = DecimalField
    moneda = CharField  # COP, USD, etc.
    proveedor = CharField  # mercadopago, stripe, paypal, wompi, pse, nequi, daviplata
    estado = CharField  # pending, paid, failed, refunded
    proveedor_preference_id = CharField
    proveedor_payment_id = CharField
    fecha_creacion = DateTimeField
    fecha_actualizacion = DateTimeField
```

---

## Proceso de Activación General

Para cualquier método de pago:

1. ✅ Instalar dependencias necesarias
2. ✅ Configurar variables de entorno
3. ✅ Descomentar imports en `views.py`
4. ✅ Mover código de `views_extra.py` a `views.py`
5. ✅ Descomentar URLs en `urls.py`
6. ✅ Reiniciar el servidor Django
7. ✅ Actualizar el frontend para mostrar el nuevo método

---

## Frontend

Para agregar un método de pago en el frontend:

1. Actualizar el componente de planes para mostrar el nuevo botón
2. Crear función para llamar al endpoint correspondiente
3. Manejar la redirección al checkout del proveedor

---

## Notas Importantes

- 🔒 Todos los webhooks deben tener `csrf_exempt`
- 🔐 Valida las firmas de los webhooks en producción
- 📝 El campo `proveedor` en el modelo `Pago` identifica el método usado
- 💰 Ajusta la moneda según el método de pago (COP para Colombia, USD para internacionales)
- 🌍 Configura las URLs de producción en las variables de entorno

---

## Testing

Para probar cada método:

1. Usa el modo sandbox/test de cada proveedor
2. Verifica que los webhooks lleguen correctamente
3. Prueba casos de éxito y fallo
4. Verifica que se cree la suscripción correctamente

---

## Soporte

Si necesitas ayuda con algún método de pago específico, consulta la documentación oficial:

- **Mercado Pago:** https://www.mercadopago.com.co/developers
- **Stripe:** https://stripe.com/docs
- **PayPal:** https://developer.paypal.com
- **Wompi:** https://docs.wompi.co
- **ePayco (PSE):** https://epayco.co/docs
- **Nequi:** https://conecta.nequi.com.co
