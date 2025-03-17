from django.urls import path
from ..controller.auth_controler import AuthController

urlpatterns = [
    path('login', AuthController.as_view({'post': 'login'})),
]