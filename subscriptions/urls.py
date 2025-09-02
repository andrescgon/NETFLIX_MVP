from django.urls import path
from .views import ListaPlanesView, SuscribirseView, MiSuscripcionView
from .views import VistaProtegidaDemo

urlpatterns = [
    path("planes/", ListaPlanesView.as_view(), name="planes"),
    path("suscribirse/", SuscribirseView.as_view(), name="suscribirse"),
    path("mi/", MiSuscripcionView.as_view(), name="mi-suscripcion"),
    path("demo/", VistaProtegidaDemo.as_view(), name="demo"),
]
