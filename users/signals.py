from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def crear_perfil_principal(sender, instance, created, **kwargs):
    if not created:
        return
    try:
        from profiles.models import Perfil
        if not Perfil.objects.filter(usuario=instance).exists():
            Perfil.objects.create(usuario=instance, nombre='Principal', edad=None)  # , es_admin=True si usas la columna
    except Exception:
        # Evita romper el alta si falla (por ej. tabla no disponible)
        pass
