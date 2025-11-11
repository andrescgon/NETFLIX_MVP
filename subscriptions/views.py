from rest_framework import generics, permissions
from .models import Plan, Suscripcion
from .serializers import PlanSerializer, CrearSuscripcionSerializer, MiSuscripcionSerializer, SuscripcionAdminSerializer


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import EsSuscriptorActivo

class ListaPlanesView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer


class SuscribirseView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CrearSuscripcionSerializer


class MiSuscripcionView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MiSuscripcionSerializer

    def get_object(self):
        return (
            Suscripcion.objects
            .filter(usuario=self.request.user)
            .order_by("-fecha_inicio")
            .first()
        )

class VistaProtegidaDemo(APIView):
    permission_classes = [IsAuthenticated, EsSuscriptorActivo]

    def get(self, request):
        return Response({"mensaje": "Accediste a contenido premium 🎬"})


# ==================== VISTAS DE ADMINISTRACIÓN ====================
class ListaSuscripcionesAdminView(generics.ListAPIView):
    """Vista para listar todas las suscripciones (Admin)"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Suscripcion.objects.all().select_related('usuario', 'plan').order_by('-fecha_inicio')
    serializer_class = SuscripcionAdminSerializer


class CancelarSuscripcionAdminView(APIView):
    """Vista para cancelar una suscripción (Admin)"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            suscripcion = Suscripcion.objects.get(pk=pk)
            suscripcion.estado = 'cancelada'
            suscripcion.save()

            serializer = SuscripcionAdminSerializer(suscripcion)
            return Response(serializer.data, status=200)
        except Suscripcion.DoesNotExist:
            return Response({"detail": "Suscripción no encontrada"}, status=404)
