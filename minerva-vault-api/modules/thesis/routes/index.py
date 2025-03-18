from django.urls import path
from ..controller import ThesisController

urlpatterns = [
    path('', ThesisController.as_view({'post': 'create'})),
]