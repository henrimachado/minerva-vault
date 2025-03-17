from django.urls import path
from ..controller.users_controller import UserController

urlpatterns = [
    path('me', UserController.as_view({'get': 'me'})),
    path('<uuid:pk>', UserController.as_view({'patch': 'update'})),
    path('<uuid:pk>/change-password', UserController.as_view({'post': 'change_password'})),
]