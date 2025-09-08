from django.urls import path
from .views import (
    RecentHistoryView,
)

urlpatterns = [
    path('recent/',  RecentHistoryView.as_view(), name='history-recent'),
]
