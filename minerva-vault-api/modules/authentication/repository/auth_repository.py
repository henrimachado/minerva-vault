from django.contrib.auth import authenticate   
from django.contrib.auth.models import User

class AuthRepository:
    def authenticate_user(self, username: str, password: str):
        return authenticate(username=username, password=password)
    