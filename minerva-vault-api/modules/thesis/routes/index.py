from django.urls import path
from ..controller import ThesisController

urlpatterns = [
    path('', ThesisController.as_view({'get' : 'list', 'post': 'create'})),
    path('me', ThesisController.as_view({'get': 'me'})),
    path('<uuid:pk>', ThesisController.as_view({
        'get': 'get',
        'patch': 'update',
        'delete': 'delete'  
    })),
]