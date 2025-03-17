from django.urls import path
from ..controller import UserController, RoleController


urlpatterns = [
    path('me', UserController.as_view({'get': 'me'})),
    path('', UserController.as_view({'get': 'list'})),
    path('roles', RoleController.as_view({'get': 'list'})),
    path('', UserController.as_view({'post': 'create'})),
    path('<uuid:pk>', UserController.as_view({'patch': 'update'})),
    path('<uuid:pk>/change-password', UserController.as_view({'post': 'change_password'})),
] 
