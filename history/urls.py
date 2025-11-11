from django.urls import path
from .views import (
    RecentHistoryView,
    AllHistoryAdminView,
    UpdateProgressView,
    GetProgressView,
    RecommendationsView,
)

urlpatterns = [
    path('recent/',  RecentHistoryView.as_view(), name='history-recent'),
    path('all/', AllHistoryAdminView.as_view(), name='history-all-admin'),
    path('progress/', UpdateProgressView.as_view(), name='update-progress'),
    path('progress/<int:pelicula_id>/', GetProgressView.as_view(), name='get-progress'),
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
]
