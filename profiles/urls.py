from rest_framework.routers import DefaultRouter
from .views import PerfilViewSet

router = DefaultRouter()
router.register(r'perfiles', PerfilViewSet, basename='perfil')

urlpatterns = router.urls
