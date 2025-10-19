from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardStatsView,
    RecentActivityView,
    PeliculaAdminViewSet,
    ActorAdminViewSet,
    DirectorAdminViewSet,
    GeneroAdminViewSet,
    UsuarioAdminViewSet,
    PlanAdminViewSet
)

# Router para ViewSets
router = DefaultRouter()
router.register(r'peliculas', PeliculaAdminViewSet, basename='pelicula-admin')
router.register(r'actores', ActorAdminViewSet, basename='actor-admin')
router.register(r'directores', DirectorAdminViewSet, basename='director-admin')
router.register(r'generos', GeneroAdminViewSet, basename='genero-admin')
router.register(r'usuarios', UsuarioAdminViewSet, basename='usuario-admin')
router.register(r'planes', PlanAdminViewSet, basename='plan-admin')

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('activity/', RecentActivityView.as_view(), name='recent_activity'),
    path('', include(router.urls)),
]
