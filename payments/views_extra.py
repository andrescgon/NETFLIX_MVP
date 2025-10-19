"""
==================== ESTRUCTURA DE OTROS MÉTODOS DE PAGO ====================
Este archivo contiene la estructura comentada para integrar otros métodos de pago.
Puedes descomentar y configurar según necesites.
"""

# ==================== STRIPE ====================
"""
class CrearStripeCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # Crear registro de pago
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='USD',
            proveedor='stripe',
        )

        try:
            # Crear sesión de checkout de Stripe
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': int(float(plan.precio) * 100),  # Stripe usa centavos
                        'product_data': {
                            'name': f'Suscripción {plan.nombre}',
                            'description': f'Plan {plan.nombre} - {plan.duracion_dias} días'
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=settings.FRONTEND_SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=settings.FRONTEND_CANCEL_URL,
                metadata={
                    'pago_id': pago.id,
                    'user_id': request.user.pk,
                    'plan_id': plan.id,
                },
                customer_email=request.user.email,
            )

            pago.proveedor_preference_id = checkout_session.id
            pago.save()

            return Response({
                'checkout_url': checkout_session.url,
                'session_id': checkout_session.id
            }, status=200)

        except Exception as e:
            return Response({
                'detail': f'Error al crear sesión de Stripe: {str(e)}'
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            # Verificar la firma del webhook
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse(status=400)

        # Manejar el evento
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            # Obtener metadata
            pago_id = session.get('metadata', {}).get('pago_id')
            plan_id = session.get('metadata', {}).get('plan_id')

            if pago_id:
                try:
                    pago = Pago.objects.get(id=pago_id)
                    pago.estado = 'paid'
                    pago.proveedor_payment_id = session.get('payment_intent')
                    pago.save()

                    # Crear suscripción
                    if plan_id:
                        plan = Plan.objects.get(id=plan_id)
                        Suscripcion.crear_desde_plan(pago.usuario, plan)

                except Exception as e:
                    print(f"Error procesando pago Stripe: {e}")

        return HttpResponse(status=200)
"""


# ==================== PAYPAL ====================
"""
class CrearPayPalPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # Crear registro de pago
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='USD',
            proveedor='paypal',
        )

        # Crear pago de PayPal
        payment = PayPalPayment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": settings.FRONTEND_SUCCESS_URL,
                "cancel_url": settings.FRONTEND_CANCEL_URL
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": f"Suscripción {plan.nombre}",
                        "sku": f"plan_{plan.id}",
                        "price": str(float(plan.precio)),
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": str(float(plan.precio)),
                    "currency": "USD"
                },
                "description": f"Plan {plan.nombre} - {plan.duracion_dias} días",
                "custom": str(pago.id)  # Para identificar el pago en el webhook
            }]
        })

        if payment.create():
            pago.proveedor_preference_id = payment.id
            pago.save()

            # Obtener URL de aprobación
            for link in payment.links:
                if link.rel == "approval_url":
                    return Response({
                        'approval_url': link.href,
                        'payment_id': payment.id
                    }, status=200)
        else:
            return Response({
                'detail': 'Error al crear pago PayPal',
                'error': payment.error
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class PayPalWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # PayPal envía eventos de webhook
        event_type = request.data.get('event_type')
        resource = request.data.get('resource', {})

        if event_type == 'PAYMENT.SALE.COMPLETED':
            custom_id = resource.get('custom_id')  # ID del pago
            payment_id = resource.get('id')

            if custom_id:
                try:
                    pago = Pago.objects.get(id=custom_id)
                    pago.estado = 'paid'
                    pago.proveedor_payment_id = payment_id
                    pago.save()

                    # Crear suscripción
                    if pago.plan_id_ref:
                        plan = Plan.objects.get(id=pago.plan_id_ref)
                        Suscripcion.crear_desde_plan(pago.usuario, plan)

                except Exception as e:
                    print(f"Error procesando pago PayPal: {e}")

        return HttpResponse(status=200)
"""


# ==================== WOMPI (Colombia) ====================
"""
class CrearWompiTransactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # Crear registro de pago
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='COP',
            proveedor='wompi',
        )

        # Wompi usa referencias únicas
        reference = f"NETFLIX_{pago.id}_{request.user.pk}"

        # Datos de la transacción
        transaction_data = {
            "amount_in_cents": int(float(plan.precio) * 100),
            "currency": "COP",
            "customer_email": request.user.email,
            "reference": reference,
            "redirect_url": settings.FRONTEND_SUCCESS_URL,
            "public_key": settings.WOMPI_PUBLIC_KEY
        }

        pago.proveedor_preference_id = reference
        pago.save()

        # URL de checkout de Wompi
        checkout_url = f"https://checkout.wompi.co/p/?{urlencode(transaction_data)}"

        return Response({
            'checkout_url': checkout_url,
            'reference': reference
        }, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class WompiWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        event = request.data.get('event')
        data = request.data.get('data', {})

        if event == 'transaction.updated':
            transaction = data.get('transaction', {})
            status = transaction.get('status')
            reference = transaction.get('reference')

            if reference and reference.startswith('NETFLIX_'):
                # Extraer ID del pago de la referencia
                try:
                    pago_id = int(reference.split('_')[1])
                    pago = Pago.objects.get(id=pago_id)

                    if status == 'APPROVED':
                        pago.estado = 'paid'
                        pago.proveedor_payment_id = transaction.get('id')
                        pago.save()

                        # Crear suscripción
                        if pago.plan_id_ref:
                            plan = Plan.objects.get(id=pago.plan_id_ref)
                            Suscripcion.crear_desde_plan(pago.usuario, plan)

                    elif status in ('DECLINED', 'ERROR'):
                        pago.estado = 'failed'
                        pago.proveedor_payment_id = transaction.get('id')
                        pago.save()

                except Exception as e:
                    print(f"Error procesando pago Wompi: {e}")

        return HttpResponse(status=200)
"""


# ==================== PSE (Colombia - Pagos Online) ====================
"""
class CrearPSEPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        bank_code = request.data.get("bank_code")  # Código del banco PSE
        person_type = request.data.get("person_type", "0")  # 0=Natural, 1=Jurídica

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # Crear registro de pago
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='COP',
            proveedor='pse',
        )

        # PSE requiere integración con un proveedor (ej: ePayco, PayU, etc.)
        # Aquí ejemplo conceptual

        return Response({
            'message': 'PSE payment structure ready',
            'pago_id': pago.id
        }, status=200)
"""


# ==================== NEQUI (Colombia) ====================
"""
class CrearNequiPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        phone_number = request.data.get("phone_number")

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # Crear registro de pago
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='COP',
            proveedor='nequi',
        )

        # Nequi requiere integración con su API
        # Push notification al celular para aprobar pago

        return Response({
            'message': 'Nequi payment structure ready',
            'pago_id': pago.id
        }, status=200)
"""


# ==================== DAVIPLATA (Colombia) ====================
"""
class CrearDaviplataPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        phone_number = request.data.get("phone_number")

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # Crear registro de pago
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='COP',
            proveedor='daviplata',
        )

        # DaviPlata requiere integración con su API

        return Response({
            'message': 'DaviPlata payment structure ready',
            'pago_id': pago.id
        }, status=200)
"""
