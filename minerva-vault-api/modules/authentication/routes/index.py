from django.urls import path
from ..controller import AuthController

urlpatterns = [
    path('login', AuthController.as_view({'post': 'login'})),
]