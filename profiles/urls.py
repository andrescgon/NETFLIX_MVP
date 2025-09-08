from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerfilViewSet, ActivarPerfilView
from .views import DesactivarPerfilView
from .views import VerPerfilActivoView

router = DefaultRouter()
router.register(r'perfiles', PerfilViewSet, basename='perfil')

urlpatterns = [

    # Activar perfil (no usa router para que no aparezca form)
    path('perfiles/<int:perfil_id>/activar/', ActivarPerfilView.as_view(), name='activar-perfil'),
    path('perfiles/activo/', VerPerfilActivoView.as_view(), name='perfil-activo'),
    path('perfiles/desactivar/', DesactivarPerfilView.as_view(), name='desactivar-perfil'),

    path('', include(router.urls)),
]
