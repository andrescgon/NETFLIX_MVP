from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ('name', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = Usuario.objects.create(**validated_data)
        user.set_password(password)  # Esto hashea la contraseña
        user.save()
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer para devolver información del usuario actual"""
    class Meta:
        model = Usuario
        fields = ('id_usuario', 'name', 'email', 'is_staff', 'is_superuser', 'is_active', 'fecha_registro', 'last_login')
        read_only_fields = fields


class UserAdminSerializer(serializers.ModelSerializer):
    """Serializer para gestión de usuarios en el panel de administración"""
    suscripcion_activa = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ('id_usuario', 'name', 'email', 'is_staff', 'is_superuser', 'is_active', 'fecha_registro', 'last_login', 'suscripcion_activa')
        read_only_fields = ('id_usuario', 'fecha_registro', 'last_login')

    def get_suscripcion_activa(self, obj):
        from subscriptions.models import Suscripcion
        suscripcion = Suscripcion.objects.filter(usuario=obj, estado='activa').first()
        if suscripcion and suscripcion.esta_activa():
            return {
                'plan': suscripcion.plan.nombre,
                'fecha_fin': suscripcion.fecha_fin
            }
        return None