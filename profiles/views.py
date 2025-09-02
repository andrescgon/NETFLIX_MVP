from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Perfil
from .serializers import PerfilSerializer

class PerfilViewSet(viewsets.ModelViewSet):
    serializer_class = PerfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Perfil.objects.filter(usuario=self.request.user).order_by('id_perfil')

    def perform_destroy(self, instance):
        # Evita que se quede sin ningún perfil
        if self.get_queryset().count() <= 1:
            raise ValidationError("Debes tener al menos un perfil.")
        # Si usas es_admin, puedes impedir borrar el admin:
        if instance.es_admin:
           raise ValidationError("No puedes eliminar el perfil administrador.")
        instance.delete()
