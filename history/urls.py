from django.urls import path
from .views import (
    RecentHistoryView,
    StartHistoryView,   # <-- nombre correcto
    PingHistoryView,    # <-- nombre correcto
    FinishHistoryView,  # <-- nombre correcto
)

urlpatterns = [
    path('recent/',  RecentHistoryView.as_view(), name='history-recent'),
    path('start/',   StartHistoryView.as_view(),  name='history-start'),
    path('ping/',    PingHistoryView.as_view(),   name='history-ping'),
    path('finish/',  FinishHistoryView.as_view(), name='history-finish'),
]
