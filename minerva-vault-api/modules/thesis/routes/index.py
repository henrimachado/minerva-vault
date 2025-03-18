from django.urls import path
from ..controller import ThesisController

urlpatterns = [
    path('', ThesisController.as_view({'post': 'create'})),
    path('<uuid:pk>', ThesisController.as_view({'patch': 'update', 'get': 'get'})),
]