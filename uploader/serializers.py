from rest_framework import serializers
from .models import MediaAsset

class MediaAssetSerializer(serializers.ModelSerializer):
    pelicula_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MediaAsset
        fields = (
            "id",
            "pelicula_id",
            "archivo",
            "remote_url",
            "calidad",
            "mime_type",
            "es_trailer",
            "creado_en",
        )
        read_only_fields = ("id", "creado_en")

    def validate(self, attrs):
        archivo = attrs.get("archivo")
        remote_url = attrs.get("remote_url")
        if not archivo and not remote_url:
            raise serializers.ValidationError("Debes enviar archivo o remote_url.")
        return attrs

    def create(self, validated_data):
        # El ModelSerializer ya toma pelicula_id -> FK (por el nombre del campo)
        return super().create(validated_data)
