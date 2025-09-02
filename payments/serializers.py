from rest_framework import serializers

class CrearPreferenciaSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
