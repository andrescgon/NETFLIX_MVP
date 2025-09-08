from rest_framework import serializers
from .models import Perfil


class PerfilSerializer(serializers.ModelSerializer):
    """
    - No expone es_admin (lo maneja el backend).
    - Primer perfil del usuario => es_admin=True; los demás => False.
    - Máximo 3 perfiles por cuenta.
    - Nombre único por usuario (case-insensitive).
    """
    class Meta:
        model = Perfil
        fields = ("id_perfil", "nombre", "edad")  # 👈 NO exponemos es_admin ni usuario
        read_only_fields = ("id_perfil",)

    def validate(self, attrs):
        req = self.context["request"]
        user = req.user

        # ---- Límite de 3 perfiles por usuario (al crear) ----
        if self.instance is None:
            if Perfil.objects.filter(usuario_id=user.id_usuario).count() >= 3:
                raise serializers.ValidationError("Solo se permiten 3 perfiles por cuenta.")

        # ---- Nombre único por usuario (case-insensitive) ----
        nombre = attrs.get("nombre", getattr(self.instance, "nombre", None))
        if nombre:
            qs = Perfil.objects.filter(usuario_id=user.id_usuario, nombre__iexact=nombre)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"nombre": "Ya tienes un perfil con ese nombre."})

        return attrs

    def create(self, validated_data):
        """
        Forzamos:
        - usuario = request.user
        - es_admin = True SOLO si es el primer perfil de ese usuario; si no, False.
        """
        user = self.context["request"].user
        ya_tiene = Perfil.objects.filter(usuario_id=user.id_usuario).exists()

        # Construimos el perfil sin permitir que el cliente envíe es_admin
        perfil = Perfil(
            usuario_id=user.id_usuario,
            es_admin=not ya_tiene,  # primer perfil => admin
            **validated_data,
        )
        perfil.save(force_insert=True)
        return perfil

    def update(self, instance, validated_data):
        """
        No permitimos cambiar es_admin desde el cliente.
        (No viene en fields, pero por si acaso llega en validated_data lo ignoramos.)
        """
        validated_data.pop("es_admin", None)
        return super().update(instance, validated_data)
