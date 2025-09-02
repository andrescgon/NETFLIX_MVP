from rest_framework import serializers
from .models import Plan, Suscripcion

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "nombre", "precio", "duracion_dias"]


class CrearSuscripcionSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()

    def validate_plan_id(self, value):
        if not Plan.objects.filter(id=value).exists():
            raise serializers.ValidationError("Plan no encontrado.")
        return value

    def create(self, validated_data):
        usuario = self.context["request"].user
        plan = Plan.objects.get(id=validated_data["plan_id"])
        sus = Suscripcion.crear_desde_plan(usuario, plan)
        return sus


class MiSuscripcionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer()
    esta_activa = serializers.SerializerMethodField()

    class Meta:
        model = Suscripcion
        fields = ["id", "plan", "fecha_inicio", "fecha_fin", "estado", "esta_activa"]

    def get_esta_activa(self, obj):
        return obj.esta_activa()
