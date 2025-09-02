from django.urls import path
from .views import StartHistoryView, PingHistoryView, FinishHistoryView, RecentHistoryView

urlpatterns = [
    path('start/', StartHistoryView.as_view(), name='history-start'),
    path('ping/',  PingHistoryView.as_view(),  name='history-ping'),
    path('finish/', FinishHistoryView.as_view(), name='history-finish'),
    path('recent/', RecentHistoryView.as_view(), name='history-recent'),
]
