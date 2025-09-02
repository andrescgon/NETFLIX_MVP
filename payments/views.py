from django.shortcuts import render

import os
import mercadopago
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse

from subscriptions.models import Plan, Suscripcion
from .models import Pago

# SDK de MP
sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

class CrearPreferenciaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan no encontrado"}, status=404)

        # 1) crear registro de Pago (pendiente)
        pago = Pago.objects.create(
            usuario=request.user,
            plan_nombre=plan.nombre,
            plan_id_ref=plan.id,
            monto=plan.precio,
            moneda='COP',
            proveedor='mercadopago',
        )

        # 2) armar preferencia
        preference_data = {
            "items": [{
                "title": f"Suscripción {plan.nombre}",
                "quantity": 1,
                "unit_price": float(plan.precio),
                "currency_id": "COP"
            }],
            "payer": {
                "email": request.user.email  # opcional
            },
            "back_urls": {
                "success": settings.FRONTEND_SUCCESS_URL,
                "failure": settings.FRONTEND_CANCEL_URL,
                "pending": settings.FRONTEND_CANCEL_URL
            },
            "auto_return": "approved",
            "metadata": {             # volverá en el webhook
                "pago_id": pago.id,
                "user_id": request.user.pk,
                "plan_id": plan.id,
            },
            # IMPORTANTE: cambia a tu dominio público en prod
            "notification_url": "http://127.0.0.1:8000/api/pagos/webhook/mp/",
        }

        preference = sdk.preference().create(preference_data)
        pref = preference["response"]

        pago.proveedor_preference_id = pref.get("id")
        pago.save()

        # URL para redirigir al checkout (sandbox)
        init_point = pref.get("init_point") or pref.get("sandbox_init_point")
        return Response({"init_point": init_point}, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class MercadoPagoWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # MP envía query params ?type=payment&id=xxxx o ?topic=payment
        topic = request.GET.get("topic") or request.GET.get("type")
        payment_id = request.GET.get("id") or request.GET.get("data.id")

        if topic != "payment" or not payment_id:
            # compatibilidad con nuevas versiones: el payload puede venir en JSON
            try:
                data = request.data
                if isinstance(data, dict):
                    if data.get("type") == "payment" and data.get("data", {}).get("id"):
                        payment_id = data["data"]["id"]
                    else:
                        return HttpResponse(status=200)
                else:
                    return HttpResponse(status=200)
            except Exception:
                return HttpResponse(status=200)

        try:
            # 1) Consultar el pago en MP
            payment = sdk.payment().get(payment_id)["response"]
        except Exception:
            return HttpResponseBadRequest("No se pudo consultar el pago")

        status_mp = payment.get("status")        # approved / pending / rejected
        metadata = payment.get("metadata", {}) or {}
        pago_id = metadata.get("pago_id")
        plan_id = metadata.get("plan_id")

        if not pago_id:
            return HttpResponse(status=200)

        try:
            pago = Pago.objects.get(id=pago_id)
        except Pago.DoesNotExist:
            return HttpResponse(status=200)

        # 2) Si aprobado, marcar pagado y crear suscripción
        if status_mp == "approved":
            pago.estado = "paid"
            pago.proveedor_payment_id = str(payment.get("id"))
            pago.save()

            try:
                plan = Plan.objects.get(id=plan_id)
                Suscripcion.crear_desde_plan(pago.usuario, plan)
            except Exception:
                pass

        elif status_mp in ("rejected", "cancelled"):
            pago.estado = "failed"
            pago.proveedor_payment_id = str(payment.get("id"))
            pago.save()

        # MP requiere 200 OK siempre
        return HttpResponse(status=200)

    # MP también puede llamar con GET para probar
    def get(self, request):
        return HttpResponse("OK", status=200)
