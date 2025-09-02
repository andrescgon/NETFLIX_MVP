from rest_framework import serializers
from .models import Perfil

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ('id_perfil', 'nombre', 'edad')  # usuario lo ponemos desde request

    def validate(self, attrs):
        req = self.context['request']
        user = req.user

        # Límite de 3 al crear
        if self.instance is None:
            if Perfil.objects.filter(usuario=user).count() >= 3:
                raise serializers.ValidationError("Solo se permiten 3 perfiles por cuenta.")

        # Nombre único por usuario (case-insensitive)
        nombre = attrs.get('nombre', getattr(self.instance, 'nombre', None))
        qs = Perfil.objects.filter(usuario=user, nombre__iexact=nombre)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if nombre and qs.exists():
            raise serializers.ValidationError({"nombre": "Ya tienes un perfil con ese nombre."})

        return attrs

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
