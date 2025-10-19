from django.urls import path
from .views import (
    ListaPlanesView,
    SuscribirseView,
    MiSuscripcionView,
    VistaProtegidaDemo,
    ListaSuscripcionesAdminView,
    CancelarSuscripcionAdminView
)

urlpatterns = [
    path("planes/", ListaPlanesView.as_view(), name="planes"),
    path("suscribirse/", SuscribirseView.as_view(), name="suscribirse"),
    path("mi/", MiSuscripcionView.as_view(), name="mi-suscripcion"),
    path("demo/", VistaProtegidaDemo.as_view(), name="demo"),

    # Admin endpoints
    path("", ListaSuscripcionesAdminView.as_view(), name="lista-suscripciones-admin"),
    path("<int:pk>/cancelar/", CancelarSuscripcionAdminView.as_view(), name="cancelar-suscripcion-admin"),
]
